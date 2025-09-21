import { useLocation, useNavigate } from "react-router-dom";
import guest from "../assets/logos/guest.png";
import ownerh from "../assets/logos/ownerh.png";
export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="p-20">
      <div className="flex justify-center items-center gap-20 h-3/4">
        <div
          className="bigbtn"
          onClick={() => (window.location.href = "/registeruser")}
        >
          <div className="btnhead">
            <img src={guest} alt="guest or tenant" className="max-h-20" />
            <h4>Lodge Seeker</h4>
          </div>
          <div>
            Are you a traveler or a tenant seeking for lodge or apartment
          </div>
          <div className="text-black mt-4">Click here</div>
        </div>
        <div className="bigbtn" onClick={() => navigate("/registerowner")}>
          <div className="btnhead">
            <img src={ownerh} alt="guest or tenant" className="max-h-20" />
            <h4>Lodge Owner</h4>
          </div>
          <div>Do you have a lodge, space or apartment to rent out</div>
          <div className="text-black mt-4">Click here</div>
        </div>
      </div>
      {/* <div className="">another section</div> */}
    </div>
  );
}
