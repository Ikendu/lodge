// LodgeDetails.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import ownerImg from "../assets/logos/owner.png";
import ownerImg2 from "../assets/logos/ownerh.png";
import { DateRange } from "react-date-range";
import { addDays, differenceInCalendarDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function LodgeDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const lodge = location.state?.lodge;

  // Use Firebase auth state to determine whether the user is signed in
  const [user] = useAuthState(auth);

  // Fullscreen viewer state (declare hooks early so they are not conditional)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // direction: 1 for next (forward), -1 for prev (back)
  const [direction, setDirection] = useState(0);
  // viewerSources: array of image urls currently shown in the fullscreen viewer
  const [viewerSources, setViewerSources] = useState([]);
  // track whether viewer is showing lodge images or owner images
  const [viewerKind, setViewerKind] = useState("lodge");

  const handleBookNow = () => {
    // If user is not signed in, send them to login first. After login we'll
    // route them to the registration page so they can provide required NIN/details.
    if (!user) {
      navigate("/login", {
        state: {
          from: { pathname: "/registeruser", state: { from: location } },
        },
      });
      return;
    }

    // If signed in, check whether the user has completed the customer profile
    // (NIN and details). We use a simple client-side check (localStorage) here
    // as a lightweight fallback. The backend/profile endpoint can be used later
    // to validate server-side.
    let profile = null;
    try {
      profile = JSON.parse(localStorage.getItem("customerProfile") || "null");
    } catch (e) {
      profile = null;
    }

    if (!profile || !profile.nin) {
      // Not authenticated for booking (missing NIN/details) -> ask them to
      // complete registration. Preserve original lodge location so we can
      // return after registration.
      navigate("/registeruser", { state: { from: location } });
      return;
    }

    // Profile exists and contains NIN -> proceed to payment and pass lodge + profile
    // include booking dates from selectionRange
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
        lodge.owner?.photo || ownerImg,
        lodge.owner?.photo2 || ownerImg2,
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
      : lodge.owner?.photo || ownerImg;

  const ownerThumbRight =
    viewerOpen && viewerKind === "owner"
      ? viewerSources[(currentIndex + 1) % (viewerSources.length || 1)]
      : lodge.owner?.photo2 || ownerImg2;

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
            src={images[0]}
            alt={lodge.title}
            className="w-full h-72 object-cover cursor-pointer"
            onClick={() => openViewer(0, "lodge")}
          />
          <div className="flex flex-wrap">
            <img
              src={images[1]}
              alt={`${lodge.title} view 2`}
              className="w-1/2 h-48 object-cover cursor-pointer"
              onClick={() => openViewer(1, "lodge")}
            />
            <img
              src={images[2]}
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
                {lodge.title}
              </h2>
              <p className="text-gray-500 mb-4">{lodge.location}</p>

              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-600 font-semibold text-xl">
                  ₦{lodge.price.toLocaleString()}/night
                </span>
                <div className="flex items-center text-yellow-500">
                  <Star size={18} className="fill-yellow-500" />
                  <span className="ml-1 text-sm font-medium">
                    {lodge.rating}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{lodge.description}</p>

              {/* Inline date range picker */}
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

              <div className="mb-4 text-sm text-gray-700">
                {nights > 0 ? (
                  <>
                    <div>
                      <strong>{nights}</strong> night{nights > 1 ? "s" : ""}
                    </div>
                    <div>
                      Total: <strong>₦{total.toLocaleString()}</strong>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">Select dates</div>
                )}
              </div>

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
                    alt={lodge.owner?.fullName || "Owner"}
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
                  <div className="absolute left-2 top-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    NIN
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
                  <div className="absolute left-2 top-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Given
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-gray-800 font-semibold">
                  {lodge.owner?.fullName || "Not provided"}
                </div>
                <div className="text-sm text-gray-500">
                  {lodge.owner?.address || "Address not provided"}
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong className="text-gray-700">LGA of Origin:</strong>{" "}
                  {lodge.owner?.lga || "Not provided"}
                </div>
                <div>
                  <strong className="text-gray-700">State of Origin:</strong>{" "}
                  {lodge.owner?.state || "Not provided"}
                </div>
                <div>
                  <strong className="text-gray-700">Town:</strong>{" "}
                  {lodge.owner?.town || "Not provided"}
                </div>
                <div>
                  <strong className="text-gray-700">Village:</strong>{" "}
                  {lodge.owner?.village || "Not provided"}
                </div>
              </div>

              <div className="mt-4 border-t pt-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Next of Kin
                </h4>
                <div className="text-sm text-gray-600">
                  <div>
                    <strong className="text-gray-700">Name:</strong>{" "}
                    {lodge.owner?.nextOfKin?.name || "Not provided"}
                  </div>
                  <div>
                    <strong className="text-gray-700">Relation:</strong>{" "}
                    {lodge.owner?.nextOfKin?.relation || "Not provided"}
                  </div>
                  <div>
                    <strong className="text-gray-700">Phone:</strong>{" "}
                    {lodge.owner?.nextOfKin?.phone || "Not provided"}
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
