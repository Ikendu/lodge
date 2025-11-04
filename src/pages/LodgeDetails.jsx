// LodgeDetails.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ownerImg from "../assets/icons/user.png";
import ownerImg2 from "../assets/icons/userNin.png";
import { DateRange } from "react-date-range";
import { addDays, differenceInCalendarDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function LodgeDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const stateLodge = location.state?.lodge;
  const [fetchedLodge, setFetchedLodge] = useState(null);
  const lodge = stateLodge || fetchedLodge;
  console.log("Lodge details page - lodge:", lodge, "; params:", params);

  // compute a stable key for this lodge to track payment in localStorage
  const lodgeKey =
    lodge?.id ||
    lodge?._id ||
    lodge?.raw?.id ||
    lodge?.raw?.nid ||
    lodge?.title ||
    "unknown_lodge";

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

    // Profile exists -> proceed to payment
    const booking = {
      lodge,
      profile,
      startDate: selectionRange.startDate?.toISOString()?.slice(0, 10) || null,
      endDate: selectionRange.endDate?.toISOString()?.slice(0, 10) || null,
      nights: nights || 0,
      total: total || 0,
    };
    navigate("/payment", { state: booking });
  };

  // Ensure lodge.images is an array of 3 URLs; fallback to empty strings if missing
  const images = lodge.images || ["", "", ""];

  // Booking date states (react-date-range)
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    key: "selection",
  });
  const [nights, setNights] = useState(1);
  const [total, setTotal] = useState(Number(lodge.price) || 0);

  // calculate nights and total when selectionRange changes
  useEffect(() => {
    const s = selectionRange.startDate;
    const e = selectionRange.endDate;
    const diff = differenceInCalendarDays(e, s);
    const nightsCalc = diff > 0 ? diff : 0;
    setNights(nightsCalc);
    setTotal(nightsCalc * (Number(lodge.price) || 0));
  }, [selectionRange, lodge.price]);

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
  useEffect(() => {
    if (lodge) setViewerSources(lodge.images || ["", "", ""]);
  }, [lodge]);

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
    const nin = lodge.raw?.nin || lodge?.nin;
    const email = lodge.raw?.userLoginMail || lodge?.userLoginMail;
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
            json && json.message ? json.message : "Profile not found"
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

  const changeImage = (delta) => {
    setDirection(delta > 0 ? 1 : -1);
    const len = (viewerSources && viewerSources.length) || 1;
    setCurrentIndex((p) => (p + delta + len) % len);
    playSlideSound();
  };

  const nextImage = () => changeImage(1);
  const prevImage = () => changeImage(-1);

  // Keyboard navigation when viewer is open
  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, images.length]);

  const dragThreshold = 120; // larger threshold for deliberate swipes

  // Compute owner thumbnail sources so they follow the viewer when owner images are active
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

  const leftVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  console.log("Profile info", ownerProfile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex justify-center items-center p-6">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
        variants={sectionVariants}
        initial="hidden"
        animate="show"
      >
        {/* Image Gallery Section */}
        <div className="w-full">
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
            <motion.div className="md:w-3/5" variants={leftVariants}>
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
                <div className="flex items-center text-yellow-500">
                  <Star size={18} className="fill-yellow-500" />
                  <span className="ml-1 text-sm font-medium">
                    {lodge?.rating}
                  </span>
                </div>
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
              <div>
                <span className="text-blue-400 font-bold">Lodge Type:</span>
                <span className="text-gray-700 mb-4">
                  {" "}
                  {lodge?.raw?.type || lodge?.type}
                </span>
              </div>
              {/* Inline date range picker */}
              {!lodge?.reference && (
                <div className="mb-4">
                  <DateRange
                    ranges={[selectionRange]}
                    onChange={(ranges) => {
                      const sel = ranges.selection;
                      let end = sel.endDate;
                      if (differenceInCalendarDays(end, sel.startDate) <= 0) {
                        end = addDays(sel.startDate, 1);
                      }
                      setSelectionRange({
                        startDate: sel.startDate,
                        endDate: end,
                        key: "selection",
                      });
                    }}
                    minDate={new Date()}
                    moveRangeOnFirstSelection={false}
                    rangeColors={["#f6e05e"]}
                  />
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
                      <strong>From:</strong>{" "}
                      {lodge?.startDate ||
                        selectionRange.startDate.toLocaleDateString("en-GB")}
                    </div>
                    <div>
                      <strong>To:</strong>{" "}
                      {lodge?.endDate ||
                        selectionRange.endDate.toLocaleDateString("en-GB")}
                    </div>
                    <div>
                      <strong>{lodge?.nights || nights}</strong> night
                      {nights > 1 ? "s" : ""}
                    </div>
                    <div>
                      Total:{" "}
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
                  onClick={() => {
                    if (
                      differenceInCalendarDays(
                        selectionRange.endDate,
                        selectionRange.startDate
                      ) <= 0
                    ) {
                      return alert(
                        "Please select an end date after the start date"
                      );
                    }
                    handleBookNow();
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-full shadow-md transition-all"
                >
                  Book Now
                </motion.button>
              )}
            </motion.div>

            {/* Right: Owner Info (40%) */}
            <motion.aside
              className="md:w-2/5 mt-6 md:mt-0 bg-gray-50 p-4 rounded-lg"
              variants={rightVariants}
            >
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

                  <div className="text-sm text-gray-600 space-y-2">
                    {/* hide sensitive owner contact until customer has completed payment for this lodge */}
                    {(() => {
                      const paid = Boolean(
                        typeof window !== "undefined" &&
                          localStorage.getItem(
                            `paid_lodge_${encodeURIComponent(lodgeKey)}`
                          )
                      );
                      return (
                        <>
                          <div>
                            <strong className="text-gray-700">Email:</strong>{" "}
                            {paid || lodge?.reference ? (
                              ownerProfile?.userLoginMail || "Not provided"
                            ) : (
                              <span className="italic text-gray-500">
                                Hidden until payment
                              </span>
                            )}
                          </div>
                          <div>
                            <strong className="text-gray-700">Mobile:</strong>{" "}
                            {paid || lodge?.reference ? (
                              ownerProfile?.mobile || "Not provided"
                            ) : (
                              <span className="italic text-gray-500">
                                Hidden until payment
                              </span>
                            )}
                          </div>
                          <div>
                            <strong className="text-gray-700">Phone:</strong>{" "}
                            {paid || lodge?.reference ? (
                              ownerProfile?.phone || "Not provided"
                            ) : (
                              <span className="italic text-gray-500">
                                Hidden until payment
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
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
            <div className="flex items-center justify-center gap-3">
              <a
                href="tel:+2349023977057"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700"
                aria-label="Call admin"
              >
                Call Admin: +234 902 397 7057
              </a>

              <a
                href="https://wa.me/2349023977057"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-600"
                aria-label="Chat on WhatsApp"
              >
                <FaWhatsapp />
                Chat on WhatsApp
              </a>
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
                          navigate("/login", { state: { from: location } });
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
                          navigate("/registeruser", {
                            state: { from: location },
                          });
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
