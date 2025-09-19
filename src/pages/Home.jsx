import guest from "../assets/logos/guest.png";
import owner from "../assets/logos/owner.png";
export default function Home() {
  return (
    <div className="flex blue-500 h-screen justify-center items-center gap-20">
      <div className="">
        <div>
          <img src={guest} alt="guest or tenant" className="max-h-20" />
          <h4>Lodge Seeker</h4>
        </div>
        <div>Are you seeking for lodge or apartment</div>
        <div>Click here</div>
      </div>
      <div>
        <div>
          <img src={owner} alt="guest or tenant" className="max-h-20" />
          <h4>Lodge Owner</h4>
        </div>
        <div>Do you have a lodge, space or apartment to rent out</div>
        <div>Click here</div>
      </div>
    </div>
  );
}
