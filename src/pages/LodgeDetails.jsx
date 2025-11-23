// LodgeDetails.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModalContext } from "../components/ui/ModalProvider";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ownerImg from "../assets/icons/user.png";
import ownerImg2 from "../assets/icons/userNin.png";
import { differenceInCalendarDays } from "date-fns";

import calendarIcon from "../assets/icons/calendar.png";
import ScrollToTop from "../components/ScrollToTop";

export default function LodgeDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const modal = useModalContext();
  const stateLodge = location.state?.lodge;
  const [fetchedLodge, setFetchedLodge] = useState(null);
  const lodge = stateLodge || fetchedLodge;
  // lodge details

  const startNativeRef = useRef(null);
  const endNativeRef = useRef(null);

  // Use Firebase auth state to determine whether the user is signed in
  const [user] = useAuthState(auth);

  // Fullscreen viewer state (declare hooks early so they are not conditional)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // direction: 1 for next (forward), -1 for prev (back)
  const [direction, setDirection] = useState(0);
  // Modal state for booking flow (not signed in / missing profile)
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalType, setBookingModalType] = useState(null); // 'notSignedIn' | 'noProfile' | null
  // viewerSources: array of image urls currently shown in the fullscreen viewer
  const [viewerSources, setViewerSources] = useState([]);
  // track whether viewer is showing lodge images or owner images
  const [viewerKind, setViewerKind] = useState("lodge");
  // Owner profile state (fetched from backend using lodge nin + user email)
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState(null);

  useEffect(() => {
    if (lodge) setViewerSources(lodge?.images || ["", "", ""]);
  }, [lodge]);

  useEffect(() => {
    if (!viewerOpen) setViewerSources(images);
  }, [viewerOpen]);

  // when viewer closes, reset the kind back to lodge
  useEffect(() => {
    if (!viewerOpen) setViewerKind("lodge");
  }, [viewerOpen]);

  // Fetch owner profile when lodge is available
  useEffect(() => {
    if (!lodge) return;
    const nin = lodge?.raw?.nin || lodge?.nin;
    const email = lodge?.raw?.userLoginMail || lodge?.userLoginMail;
    if (!nin && !email) return; // nothing to query

    let mounted = true;
    setOwnerLoading(true);
    setOwnerError(null);
    setOwnerProfile(null);

    fetch("https://lodge.morelinks.com.ng/api/get_profile.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nin: nin || lodge?.lodge_nin,
        email: email || lodge?.lodge_email,
      }),
    })
      .then((r) => r.text())
      .then((text) => {
        if (!mounted) return;
        let json = null;
        try {
          json = JSON.parse(text);

          // handle parsed JSON below
        } catch (e) {
          console.warn("Invalid JSON from get_profile.php:", text);
          setOwnerError("Invalid server response");
          return;
        }
        if (json && json.success && json.profile) {
          setOwnerProfile(json.profile);
          localStorage.setItem("ownerProfile", JSON.stringify(json.profile));
        } else {
          setOwnerError(
            json && json.message
              ? json.message
              : "Owner's Profile not found, please contact admin before booking"
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch owner profile:", err);
        if (!mounted) return;
        setOwnerError(String(err));
      })
      .finally(() => mounted && setOwnerLoading(false));

    return () => {
      mounted = false;
    };
  }, [lodge]);

  // Ensure lodge.images is an array of 3 URLs; fallback to empty strings if missing
  const images = lodge?.images || ["", "", ""];

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, images?.length]);

  // helper to resolve owner image fields which may be:
  // - a full URL (http/https)
  // - a data URI
  // - a filename (e.g. "abc.jpg")
  // - a leading-slash path ("/userImage/abc.jpg")
  // - an array or JSON-stringified array
  // Backend is inconsistent between "/userImage/" and "/api/userImage/" so prefer the public base used by get_profile.php
  const ownerImageBase = "https://lodge.morelinks.com.ng/api/userImage/";
  const resolveOwnerImage = (val) => {
    if (!val) return null;

    // unwrap arrays
    if (Array.isArray(val)) {
      val = val[0];
      if (!val) return null;
    }

    // handle objects
    if (typeof val === "object") {
      if (val.url) val = val.url;
      else val = String(val);
    }

    // attempt to parse JSON strings (some APIs return JSON-encoded arrays)
    if (typeof val === "string") {
      const s = val.trim();
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return resolveOwnerImage(parsed[0]);
        if (parsed && typeof parsed === "object" && parsed.url)
          return resolveOwnerImage(parsed.url);
      } catch (e) {
        // not JSON — continue
      }

      // full URLs and data URIs are used as-is
      if (s.startsWith("http") || s.startsWith("data:")) return s;

      // if it's already a path containing userImage, return as-is (might be absolute or relative path)
      if (s.includes("/userImage/")) {
        // ensure it is absolute
        if (s.startsWith("/"))
          return `${window.location.protocol}//${window.location.host}${s}`;
        return s;
      }

      // otherwise assume it's a filename and prefix the public base
      return ownerImageBase + encodeURIComponent(s);
    }

    return null;
  };

  const handleBookNow = () => {
    // Booking flow logic now shows a modal instead of immediate redirects
    // when the user is not signed in or missing profile information.
    if (!user || !user.email) {
      setBookingModalType("notSignedIn");
      setBookingModalOpen(true);
      return;
    }

    // If signed in, check client-side stored profile
    let profile = null;
    try {
      profile = JSON.parse(localStorage.getItem("customerProfile") || "null");
    } catch (e) {
      profile = null;
    }

    if (!profile || !profile.nin) {
      setBookingModalType("noProfile");
      setBookingModalOpen(true);
      return;
    }

    // Profile exists -> check availability before proceeding to payment
    (async () => {
      // Block booking early if owner has manually marked this lodge unavailable
      if (lodge?.raw.availability == 0) {
        await modal.alert({
          title: "Not available",
          message:
            "This lodge is currently marked unavailable by the owner. Please check another lodge.",
        });
        return;
      }
      const payload = {
        lodge_id: lodge?.id || lodge?.raw?.id || null,
        startDate: selectionRange.startDate
          ? formatLocalDate(selectionRange.startDate)
          : null,
        endDate: selectionRange.endDate
          ? formatLocalDate(selectionRange.endDate)
          : null,
      };
      try {
        const res = await fetch(
          "https://lodge.morelinks.com.ng/api/check_availability.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          await modal.alert({
            title: "Availability check failed",
            message: "Invalid server response",
          });
          return;
        }
        if (!json.success) {
          await modal.alert({
            title: "Availability check failed",
            message: json.message || "Could not check availability",
          });
          return;
        }
        if (!json.available) {
          // show first conflict range to the user
          const first = json.conflicts && json.conflicts[0];
          const msg = first
            ? `Selected dates have been booked (from ${first.start_date} to ${first.end_date}). Please pick other dates or contact admin.`
            : "Selected dates are not available. Please pick other dates.";
          await modal.alert({ title: "Dates unavailable", message: msg });
          return;
        }

        // Available -> proceed to payment
        const booking = {
          lodge,
          profile,
          startDate: selectionRange.startDate
            ? formatLocalDate(selectionRange.startDate)
            : null,
          endDate: selectionRange.endDate
            ? formatLocalDate(selectionRange.endDate)
            : null,
          nights: nights || 0,
          total: total || 0,
        };
        navigate("/payment", { state: booking });
      } catch (err) {
        console.error("Availability check error", err);
        try {
          await modal.alert({
            title: "Network error",
            message: "Failed to check availability. Try again.",
          });
        } catch (e) {}
      }
    })();
  };

  // Booking date states (react-date-range)
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    key: "selection",
  });
  const [nights, setNights] = useState(1);
  const [total, setTotal] = useState(Number(lodge?.price) || 0);

  // string inputs for manual/typed dates (format YYYY-MM-DD)
  const [startInput, setStartInput] = useState(
    // format locally to avoid timezone shifts
    `${selectionRange.startDate.getFullYear()}-${String(
      selectionRange.startDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectionRange.startDate.getDate()).padStart(
      2,
      "0"
    )}`
  );
  const [endInput, setEndInput] = useState(
    `${selectionRange.endDate.getFullYear()}-${String(
      selectionRange.endDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectionRange.endDate.getDate()).padStart(
      2,
      "0"
    )}`
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // availability state: null = unknown, true = available, false = not available
  const [availability, setAvailability] = useState(null);
  const [availabilityConflicts, setAvailabilityConflicts] = useState([]);

  // synchronize owner-marked availability when lodge is provided (could be 0/1, "0"/"1", true/false)
  useEffect(() => {
    if (!lodge) return;
    const val = lodge?.raw?.availability;

    if (val === undefined || val === null) return;

    setAvailability(val);
  }, [lodge]);

  // helper: safely parse yyyy-mm-dd into a local Date (no timezone shift), return null if invalid
  const parseDateInput = (s) => {
    if (!s) return null;
    // Accept both YYYY-MM-DD and DD/MM/YYYY by normalizing
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split("/");
      s = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const [y, m, d] = s.split("-").map((x) => parseInt(x, 10));
    if (!y || !m || !d) return null;
    // Use local Date constructor to avoid timezone offset issues
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    if (isNaN(dt.getTime())) return null;
    return dt;
  };

  // format a Date to local YYYY-MM-DD (avoid timezone offsets)
  const formatLocalDate = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
      dt.getDate()
    ).padStart(2, "0")}`;

  // Format a yyyy-mm-dd string (or Date) as DD/MM/YYYY for display
  const formatDisplayDate = (val) => {
    if (!val) return "";
    let dt = null;
    if (typeof val === "string") dt = parseDateInput(val);
    else if (val instanceof Date) dt = val;
    if (!dt) return "";
    const d = String(dt.getDate()).padStart(2, "0");
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const y = dt.getFullYear();
    return `${d}/${m}/${y}`;
  };

  // calculate nights and total when selectionRange changes
  useEffect(() => {
    const s = selectionRange.startDate;
    const e = selectionRange.endDate;
    const diff = differenceInCalendarDays(e, s);
    const nightsCalc = diff > 0 ? diff : 0;
    setNights(nightsCalc);
    setTotal(nightsCalc * (Number(lodge?.price) || 0));
    // keep text inputs in sync when selectionRange changes
    try {
      // format as local YYYY-MM-DD to avoid timezone shifts
      setStartInput(formatLocalDate(selectionRange.startDate));
      setEndInput(formatLocalDate(selectionRange.endDate));
    } catch (e) {
      // ignore
    }
  }, [selectionRange, lodge?.price]);

  // detect touch devices (used to render native date picker on mobile)
  useEffect(() => {
    try {
      const touch =
        typeof navigator !== "undefined" &&
        (navigator.maxTouchPoints > 0 || "ontouchstart" in window);
      setIsTouchDevice(Boolean(touch));
    } catch (e) {
      setIsTouchDevice(false);
    }
  }, []);

  // Optionally check availability in background when dates change and lodge id is present
  // This effect also runs on first render so availability is known immediately.
  useEffect(() => {
    let mounted = true;
    if (!lodge || !(lodge?.id || lodge?.raw?.id)) return;
    const check = async () => {
      const payload = {
        lodge_id: lodge?.id || lodge?.raw?.id || null,
        startDate:
          selectionRange.startDate?.toISOString()?.slice(0, 10) || null,
        endDate: selectionRange.endDate?.toISOString()?.slice(0, 10) || null,
      };
      try {
        const res = await fetch(
          "https://lodge.morelinks.com.ng/api/check_availability.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json();
        if (!mounted) return;
        // update local availability states for UI
        setAvailability(json && json.success ? Boolean(json.available) : null);
        setAvailabilityConflicts(json && json.conflicts ? json.conflicts : []);

        // also attach availability to fetchedLodge if we have one
        setFetchedLodge((prev) => {
          try {
            if (!prev) return prev;
            return {
              ...prev,
              availability: json && json.success ? json.available : null,
              availability_conflicts:
                json && json.conflicts ? json.conflicts : [],
            };
          } catch (e) {
            return prev;
          }
        });
      } catch (e) {
        // ignore background availability errors
      }
    };
    check();
    return () => (mounted = false);
  }, [selectionRange.startDate, selectionRange.endDate, lodge]);

  // helper to open the native date picker in a cross-browser way.
  // Some browsers (older Safari on iOS) don't implement showPicker(). In that case
  // we try focus()+click() and as a last resort temporarily make the hidden
  // input visible so the user can tap it.
  const openDatePicker = (ref) => {
    if (!ref || !ref.current) return;
    const el = ref.current;
    try {
      if (typeof el.showPicker === "function") {
        el.showPicker();
        return;
      }
    } catch (e) {
      // continue to fallbacks
    }

    try {
      // Focus the input. Avoid programmatic click() which can cause unexpected
      // behavior in some browsers (and recursion with event handlers). Focusing
      // makes the control ready for user interaction which tends to open the
      // native picker on most platforms when tapped/clicked by the user.
      el.focus();
    } catch (e) {
      // ignore
    }

    // For icon clicks (a user gesture) some browsers allow programmatic click.
    // Try calling click() to open the picker when showPicker isn't available.
    try {
      if (typeof el.click === "function") el.click();
    } catch (e) {
      // ignore
    }

    // If the above didn't open the picker (some iOS versions), make the input
    // temporarily visible and focus it so the native control can be shown when
    // the user taps. We revert styles after a short timeout.
    try {
      const prev = {
        opacity: el.style.opacity,
        width: el.style.width,
        height: el.style.height,
        pointerEvents: el.style.pointerEvents,
        position: el.style.position,
      };
      el.style.opacity = "1";
      el.style.width = "180px";
      el.style.height = "38px";
      el.style.position = "relative";
      el.style.pointerEvents = "auto";
      // focus after making visible
      setTimeout(() => {
        try {
          el.focus();
        } catch (e) {}
      }, 50);
      // revert after 2s
      setTimeout(() => {
        try {
          el.style.opacity = prev.opacity || "0";
          el.style.width = prev.width || "8px";
          el.style.height = prev.height || "8px";
          el.style.position = prev.position || "absolute";
          el.style.pointerEvents = prev.pointerEvents || "none";
        } catch (e) {}
      }, 2000);
    } catch (e) {
      // ignore DOM style errors
    }
  };

  // swipe/drag threshold in pixels for viewer navigation
  const dragThreshold = 80;

  // viewer navigation helpers
  const prevImage = () => {
    try {
      playSlideSound();
    } catch (e) {}
    const len = (viewerSources && viewerSources.length) || 1;
    setDirection(-1);
    setCurrentIndex((i) => (i - 1 + len) % len);
  };

  const nextImage = () => {
    try {
      playSlideSound();
    } catch (e) {}
    const len = (viewerSources && viewerSources.length) || 1;
    setDirection(1);
    setCurrentIndex((i) => (i + 1) % len);
  };

  // If lodge is not provided in location state, show a friendly message.
  // This check is placed after hooks/state to avoid violating the rules of hooks.
  // If lodge wasn't supplied via location.state, try to fetch by route param id
  useEffect(() => {
    let mounted = true;
    async function fetchById() {
      if (stateLodge) return;
      const id = params.id;
      if (!id) return;
      try {
        // if id looks numeric, request by id, otherwise try title lookup
        const isNumeric = /^[0-9]+$/.test(id);
        const url = isNumeric
          ? `https://lodge.morelinks.com.ng/api/get_lodge.php?id=${encodeURIComponent(
              id
            )}`
          : `https://lodge.morelinks.com.ng/api/get_lodge.php?title=${encodeURIComponent(
              id
            )}`;
        const res = await fetch(url, { method: "GET" });
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.warn("Invalid JSON from get_lodge.php", text);
          return;
        }
        if (json && json.success && json.data) {
          if (!mounted) return;
          // normalize image fields to `images` array expected below
          const row = json.data;
          row.images = [
            row.image_first_url || null,
            row.image_second_url || null,
            row.image_third_url || null,
          ];
          // put raw back if needed
          row.raw = row.raw || {};
          setFetchedLodge(row);
        }
      } catch (e) {
        console.error("Failed to fetch lodge by id", e);
      }
    }
    fetchById();
    return () => (mounted = false);
  }, [params.id, stateLodge]);

  if (!lodge)
    return <p className="text-center mt-10 text-gray-600">Lodge not found</p>;

  // populate viewerSources from lodge.images when lodge becomes available

  const openViewer = (index, kind = "lodge") => {
    setViewerKind(kind || "lodge");
    if (kind === "lodge") {
      setViewerSources(images);
      setCurrentIndex(index);
      setViewerOpen(true);
      return;
    }
    if (kind === "owner") {
      const ownerImgs = [
        // prefer verified_image_url, then image_url, then fallbacks
        resolveOwnerImage(
          `https://lodge.morelinks.com.ng/api/userImage/${ownerProfile?.verified_image}`
        ) || ownerImg,
        resolveOwnerImage(
          `https://lodge.morelinks.com.ng/api/userImage/${ownerProfile?.image}`
        ) || ownerImg2,
      ];
      setViewerSources(ownerImgs);
      setCurrentIndex(index);
      setViewerOpen(true);
      return;
    }
    // fallback
    setViewerSources(images);
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);
  // Reset viewerSources after closing to default to lodge images

  // Play a short click/beep using WebAudio for slide feedback
  const playSlideSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 440; // A4
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      o.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // ignore audio errors on restricted browsers
    }
  };

  const ownerThumbLeft =
    viewerOpen && viewerKind === "owner"
      ? viewerSources[currentIndex]
      : resolveOwnerImage(
          `https://lodge.morelinks.com.ng/api/userImage/${ownerProfile?.verified_image}`
        ) || ownerImg;

  const ownerThumbRight =
    viewerOpen && viewerKind === "owner"
      ? viewerSources[(currentIndex + 1) % (viewerSources.length || 1)]
      : resolveOwnerImage(
          `https://lodge.morelinks.com.ng/api/userImage/${ownerProfile?.image}`
        ) || ownerImg2;

  const imageVariants = {
    enter: (dir) => ({ x: 300 * dir, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: -300 * dir, opacity: 0 }),
  };

  // Page animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.06, when: "beforeChildren" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex justify-center items-center p-3">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
        variants={sectionVariants}
        initial="hidden"
        animate="show"
      >
        <ScrollToTop />
        <i
          onClick={() => navigate(-1)}
          class="fa-solid fa-arrow-left cursor-pointer p-2 rounded-full text-white absolute top-24 left-9 z-10 bg-black"
        ></i>
        {/* Image Gallery Section */}
        <div className="w-full relative">
          {/* Availability overlay shown immediately when lodge is booked for the selected/default dates */}

          {lodge?.raw?.availability == 0 && (
            <div className="absolute inset-0 z-30 flex items-start justify-center p-4 py-14 pointer-events-none">
              <div className="bg-red-700/70 text-white font-bold rounded-md px-4 py-3 text-center pointer-events-auto max-w-2xl">
                Lodge is currently marked unavailable by the owner, Please check
                another lodge or contact Admin"
              </div>
            </div>
          )}
          {availabilityConflicts?.length > 0 &&
            !lodge?.raw?.availability == 0 && (
              <div className="absolute inset-0 z-30 flex items-start justify-center p-4 py-14 pointer-events-none">
                <div className="bg-red-700/70 text-white font-bold rounded-md px-4 py-3 text-center pointer-events-auto max-w-2xl">
                  {`Booked! - Not available from ${formatDisplayDate(
                    availabilityConflicts[0].start_date
                  )} to ${formatDisplayDate(
                    availabilityConflicts[0].end_date
                  )}, Thank you`}
                </div>
              </div>
            )}
          <img
            src={images[0] || lodge.image_first_url || ""}
            alt={lodge.title}
            className="w-full h-72 object-cover cursor-pointer"
            onClick={() => openViewer(0, "lodge")}
          />
          <div className="flex flex-wrap">
            <img
              src={images[1] || lodge.image_second_url || ""}
              alt={`${lodge.title} view 2`}
              className="w-1/2 h-48 object-cover cursor-pointer"
              onClick={() => openViewer(1, "lodge")}
            />
            <img
              src={images[2] || lodge.image_third_url || ""}
              alt={`${lodge.title} view 3`}
              className="w-1/2 h-48 object-cover cursor-pointer"
              onClick={() => openViewer(2, "lodge")}
            />
          </div>
        </div>
        {/* Fullscreen Viewer */}
        <AnimatePresence>
          {viewerOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeViewer}
            >
              <motion.div
                className="relative max-w-5xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={currentIndex}
                  src={viewerSources[currentIndex]}
                  alt={`view ${currentIndex + 1}`}
                  className="w-full max-h-[80vh] object-contain mx-auto"
                  custom={direction}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    const len = viewerSources.length || 1;
                    if (info.offset.x < -dragThreshold) nextImage();
                    if (info.offset.x > dragThreshold) prevImage();
                  }}
                />

                {/* When viewing owner images, show small clickable thumbnails inside the viewer
                    so users can click them to go prev/next even though the page behind is covered */}
                {viewerKind === "owner" && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-6 bottom-6 bg-white/80 p-1 rounded-md shadow-md"
                      aria-label="Prev owner"
                    >
                      <img
                        src={
                          viewerSources[
                            (currentIndex - 1 + viewerSources.length) %
                              viewerSources.length
                          ]
                        }
                        alt="prev owner thumb"
                        className="w-12 h-12 object-cover rounded"
                      />
                    </button>
                    {/* Overlay hint: tap to view fullscreen */}

                    <button
                      onClick={nextImage}
                      className="absolute right-6 bottom-6 bg-white/80 p-1 rounded-md shadow-md"
                      aria-label="Next owner"
                    >
                      <img
                        src={
                          viewerSources[
                            (currentIndex + 1) % viewerSources.length
                          ]
                        }
                        alt="next owner thumb"
                        className="w-12 h-12 object-cover rounded"
                      />
                    </button>
                  </>
                )}

                {/* Prev Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full"
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={20} />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full"
                  aria-label="Next image"
                >
                  <FiChevronRight size={20} />
                </button>

                {/* Close Button */}
                <button
                  onClick={closeViewer}
                  className="absolute right-3 top-3 bg-white/20 text-white p-2 rounded-full"
                  aria-label="Close viewer"
                >
                  <FiX size={18} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Details Section - split into lodge info (left) and owner info (right) */}
        <div className="p-6">
          <motion.div
            className="md:flex md:items-start md:gap-8"
            initial="hidden"
            animate="show"
            variants={sectionVariants}
          >
            {/* Left: Lodge Info (60%) */}
            <motion.div className="md:w-3/5">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {lodge?.title || lodge?.lodge_title}
              </h2>
              <p className="text-gray-500 mb-4">
                {lodge?.location || lodge?.lodge_location}
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-600 font-semibold text-xl">
                  ₦
                  {lodge?.price?.toLocaleString() ||
                    lodge?.amount?.toLocaleString()}
                  /night
                </span>
                {/* <div className="flex items-center text-yellow-500">
                  <Star size={18} className="fill-yellow-500" />
                  <span className="ml-1 text-sm font-medium">
                    {lodge?.rating}
                  </span>
                </div> */}
              </div>
              <p className="text-gray-700 mb-4">{lodge?.description}</p>
              <div>
                <span className="text-blue-400 font-bold">
                  Available Amenities:
                </span>
                <p className="text-gray-700 mb-4">
                  {lodge?.raw?.amenities || lodge?.amenities}
                </p>
              </div>
              <div>
                <span className="text-blue-400 font-bold">Bathroom Type: </span>
                <span className="text-gray-700 mb-4">
                  {lodge?.raw?.bathroomType || lodge?.bathroomType}
                </span>
              </div>
              <div>
                <span className="text-blue-400 font-bold">Capacity:</span>
                <span className="text-gray-700 mb-4">
                  {" "}
                  {lodge?.raw?.capacity || lodge?.capacity} persons
                </span>
              </div>
              <div className="mb-4">
                <span className="text-blue-400 font-bold">Lodge Type:</span>
                <span className="text-gray-700 mb-4">
                  {" "}
                  {lodge?.raw?.type || lodge?.type}
                </span>
              </div>
              <p className="text-blue-400 font-semibold">
                Select Entry and Exit dates
              </p>
              {/* Native date inputs (mobile-friendly) */}
              {!lodge?.reference && (
                <div className="mb-4">
                  <div className="space-y-4 mt-4">
                    {/* Start Date */}
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-blue-500">Start Date:</p>

                      <div className="relative">
                        {/* visible formatted display (DD/MM/YYYY) */}
                        <input
                          type="text"
                          value={formatDisplayDate(startInput)}
                          readOnly
                          onClick={() => openDatePicker(startNativeRef)}
                          onFocus={() => openDatePicker(startNativeRef)}
                          aria-label="Start date display"
                          className="px-3 py-2 border rounded-md text-gray-800 bg-white w-36"
                        />

                        {/* native date input overlaid to capture clicks and open native picker */}
                        <input
                          ref={startNativeRef}
                          type="date"
                          value={startInput}
                          onChange={(e) => {
                            const dt = parseDateInput(e.target.value);
                            if (dt) {
                              setSelectionRange((prev) => ({
                                ...prev,
                                startDate: dt,
                              }));
                            }
                            setStartInput(e.target.value);
                          }}
                          onClick={() => openDatePicker(startNativeRef)}
                          aria-label="Start date"
                          className="absolute left-0 top-0 w-36 h-full opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Calendar icon (also opens picker) */}
                      <img
                        src={calendarIcon}
                        alt="Select start date"
                        onClick={() => openDatePicker(startNativeRef)}
                        onFocus={() => openDatePicker(startNativeRef)}
                        className="w-8 h-8 cursor-pointer hover:scale-110 "
                      />
                    </div>

                    {/* End Date */}
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-blue-500">End Date:</p>

                      <div className="relative">
                        <input
                          type="text"
                          value={formatDisplayDate(endInput)}
                          readOnly
                          onClick={() => openDatePicker(endNativeRef)}
                          onFocus={() => openDatePicker(endNativeRef)}
                          aria-label="End date display"
                          className="px-3 py-2 ml-2 border rounded-md text-gray-800 bg-white w-36"
                        />

                        <input
                          ref={endNativeRef}
                          type="date"
                          value={endInput}
                          onChange={(e) => {
                            const dt = parseDateInput(e.target.value);
                            if (dt) {
                              setSelectionRange((prev) => ({
                                ...prev,
                                endDate: dt,
                              }));
                            }
                            setEndInput(e.target.value);
                          }}
                          onClick={() => openDatePicker(endNativeRef)}
                          aria-label="End date"
                          className="absolute left-0 top-0 w-36 h-full opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Calendar Icon (also opens picker) */}
                      <img
                        src={calendarIcon}
                        alt="Select end date"
                        onClick={() => openDatePicker(endNativeRef)}
                        onFocus={() => openDatePicker(startNativeRef)}
                        className="h-8 cursor-pointer hover:scale-110 transition"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 italic">
                    Tap the date fields to pick dates: Year-Month-Day.
                  </div>
                </div>
              )}
              <div className="mb-4 text-sm text-gray-700">
                {lodge?.reference ? (
                  <div className="my-3">
                    <hr />
                  </div>
                ) : null}
                {nights > 0 ? (
                  <div className="flex flex-col gap-2">
                    <div>
                      <strong className="text-blue-400">
                        {lodge?.nights || nights}
                      </strong>{" "}
                      night
                      {nights > 1 ? "s" : ""}
                    </div>
                    <div className="text-lg">
                      <span className="text-blue-400">Total: </span>
                      <strong>
                        ₦
                        {lodge?.amount?.toLocaleString() ||
                          total?.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Select dates</div>
                )}
              </div>
              {!lodge?.reference && (
                <motion.button
                  onClick={async () => {
                    if (
                      differenceInCalendarDays(
                        selectionRange.endDate,
                        selectionRange.startDate
                      ) <= 0
                    ) {
                      await modal.alert({
                        title: "Invalid dates",
                        message:
                          "Please select an end date after the start date",
                      });
                      return;
                    }
                    handleBookNow();
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={
                    "bg-yellow-400 text-black font-bold py-3 px-8 rounded-full shadow-md transition-all " +
                    "hover:bg-yellow-300"
                  }
                >
                  Book Now
                </motion.button>
              )}
            </motion.div>

            {/* Right: Owner Info (40%) */}
            <motion.aside className="md:w-2/5 mt-6 md:mt-0 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Owner Details
              </h3>

              {/* Owner images: side-by-side, each fills its column */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="relative">
                  <img
                    src={ownerThumbLeft}
                    alt={ownerProfile?.firstName || "Owner"}
                    className="w-full h-40 md:h-48 lg:h-56 object-cover rounded-md border cursor-pointer"
                    onClick={() => {
                      if (viewerOpen && viewerKind === "owner") {
                        // if viewer already showing owner images, go to previous
                        prevImage();
                      } else {
                        openViewer(0, "owner");
                      }
                    }}
                  />
                  <div className="absolute left-1 bottom-0 bg-black/60 text-white/80 text-[10px] px-1 py0.5 italic rounded">
                    tap to view fullscreen image
                  </div>
                  <div className="absolute left-2 top-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Verified
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={ownerThumbRight}
                    alt={`${lodge.owner?.fullName || "Owner"} 2`}
                    className="w-full h-40 md:h-48 lg:h-56 object-cover rounded-md border cursor-pointer"
                    onClick={() => {
                      if (viewerOpen && viewerKind === "owner") {
                        // if viewer already showing owner images, go to next
                        nextImage();
                      } else {
                        openViewer(1, "owner");
                      }
                    }}
                  />
                  {/* Overlay hint: tap to view fullscreen */}

                  <div className="absolute left-1 bottom-0 bg-black/60 text-white/80 text-[10px] px-1 py0.5 italic rounded">
                    tap to view fullscreen image
                  </div>
                  <div className="absolute left-2 top-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Given
                  </div>
                </div>
              </div>

              {ownerLoading ? (
                <div className="py-6 text-center text-gray-600">
                  Loading owner details…
                </div>
              ) : ownerError ? (
                <div className="py-4 text-sm text-red-600">{ownerError}</div>
              ) : (
                <>
                  <div className="mb-3">
                    <div className="text-gray-800 font-semibold">
                      {`${ownerProfile?.firstName} ${ownerProfile?.middleName} ${ownerProfile?.lastName}` ||
                        "Not provided"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ownerProfile?.address || "Address not provided"}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2 italic">
                    <p>
                      Other contact details will come with the booking reciept
                    </p>
                    <div>
                      <strong className="text-gray-700">LGA of Origin:</strong>{" "}
                      {ownerProfile?.lga || lodge.owner?.lga || "Not provided"}
                    </div>
                    <div>
                      <strong className="text-gray-700">
                        State of Origin:
                      </strong>{" "}
                      {ownerProfile?.state ||
                        lodge.owner?.state ||
                        "Not provided"}
                    </div>
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        </div>
        {/* Admin contact block */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="max-w-4xl mx-auto text-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Need help?
            </h4>
            <p className="text-gray-600 mb-3">
              Contact our admin for assistance with bookings or questions.
            </p>
            <div className="flex items-center justify-center gap-3  text-sm">
              <div>
                <p>Call Admin:</p>{" "}
                <a
                  href="tel:+2349023977057"
                  className="inline-flex items-center bg-blue-600 text-white px-3 py-1 font-semibold rounded-full hover:bg-blue-700"
                  aria-label="Call admin"
                >
                  0902 397 7057
                </a>
              </div>
              <div>
                <p>Chat on:</p>

                <a
                  href="https://wa.me/2349023977057"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 align-middle text-white px-3 py-1 rounded-full font-semibold hover:bg-green-600"
                  aria-label="Chat on WhatsApp"
                >
                  WhatsApp
                  <FaWhatsapp />
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Booking modal (login/register/complete profile) */}
        <AnimatePresence>
          {bookingModalOpen && (
            <motion.div
              className="fixed inset-0 z-60 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setBookingModalOpen(false)}
              />

              <motion.div
                className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-50"
                initial={{ scale: 0.98, y: 12, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.98, y: 8, opacity: 0 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {bookingModalType === "notSignedIn"
                        ? "Please sign in or register"
                        : "Complete your profile"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {bookingModalType === "notSignedIn"
                        ? "You must be signed in to make a booking. Sign in or create an account to continue."
                        : "We couldn't find your profile details (NIN or phone). Please complete your profile before booking."}
                    </p>
                  </div>
                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="mt-5 flex gap-3">
                  {bookingModalType === "notSignedIn" ? (
                    <>
                      <button
                        onClick={() => {
                          setBookingModalOpen(false);
                          const from = {
                            pathname: location.pathname,
                            search: location.search,
                            hash: location.hash,
                            // if there's a lodge in state, pass only its id to keep object small
                            lodgeId:
                              (location.state &&
                                location.state.lodge &&
                                (location.state.lodge.id ||
                                  location.state.lodge._id)) ||
                              null,
                          };
                          navigate("/login", { state: { from } });
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold"
                      >
                        Login / Register
                      </button>
                      <button
                        onClick={() => setBookingModalOpen(false)}
                        className="px-4 py-2 border rounded-md"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setBookingModalOpen(false);
                          const from = {
                            pathname: location.pathname,
                            search: location.search,
                            hash: location.hash,
                            lodgeId:
                              (location.state &&
                                location.state.lodge &&
                                (location.state.lodge.id ||
                                  location.state.lodge._id)) ||
                              null,
                          };
                          navigate("/registeruser", { state: { from } });
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold"
                      >
                        Complete Profile
                      </button>
                      <button
                        onClick={() => setBookingModalOpen(false)}
                        className="px-4 py-2 border rounded-md"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
