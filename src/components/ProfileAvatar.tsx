import profilePhoto from "../assets/Profile.png";

export function ProfileAvatar() {
  return (
    <div className="profile-wrap position-relative d-flex justify-content-center justify-content-lg-startof the image">
      <div className="profile-glow profile-float position-relative">
        <div className="profile-ring-spin" aria-hidden="true" />
        <div className="profile-avatar d-flex align-items-center justify-content-center overflow-hidden">
          <img
            src={profilePhoto}
            alt="Abhilash Neelam"
            loading="eager"
            fetchPriority="high"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        </div>
      </div>
    </div>
  );
}
