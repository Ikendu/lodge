import guest from "../assets/logos/guest.png";
import ownerh from "../assets/logos/ownerh.png";
export default function Home() {
  return (
    <div className="flex blue-500 h-screen justify-center items-center gap-20">
      <div className="bigbtn">
        <div className="btnhead">
          <img src={guest} alt="guest or tenant" className="max-h-20" />
          <h4>Lodge Seeker</h4>
        </div>
        <div>Are you a traveler or a tenant seeking for lodge or apartment</div>
        <div className="text-black">Click here</div>
      </div>
      <div className="bigbtn">
        <div className="btnhead">
          <img src={ownerh} alt="guest or tenant" className="max-h-20" />
          <h4>Lodge Owner</h4>
        </div>
        <div>Do you have a lodge, space or apartment to rent out</div>
        <div className="text-black">Click here</div>
      </div>
    </div>
  );
}
