import { GoogleLogin } from "@react-oauth/google";

interface WelcomeBannerProps {
  onSuccess: (credentialResponse: any) => void;
  onError: (error: any) => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onSuccess, onError }) => {
  return (
    <div style={{ 
      padding: "30px", 
      border: "1px solid #ddd", 
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      maxWidth: "700px",
      margin: "0 auto 30px",
      backgroundColor: "#fff"
    }}>
      <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>歡迎使用教師介聘配對系統</h2>
      
      <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "15px" }}>
        CircleMatch 是一個幫助教師找到互調機會的平台。透過多角調配對演算法，
        我們能夠找出兩人互調、三角調甚至更複雜的調動組合，大幅增加您成功介聘的機會。
      </p>
      
      <h3 style={{ margin: "25px 0 15px", color: "#2c3e50" }}>使用指南</h3>
      <ol style={{ paddingLeft: "20px", fontSize: "16px", lineHeight: "1.6" }}>
        <li style={{ marginBottom: "10px" }}>使用 Google 帳號登入系統</li>
        <li style={{ marginBottom: "10px" }}>填寫您的現職學校及想調往的地區</li>
        <li style={{ marginBottom: "10px" }}>系統會自動尋找可能的配對組合</li>
        <li style={{ marginBottom: "10px" }}>配對成功後，您可以查看對方的聯絡資訊</li>
      </ol>
      
      <h3 style={{ margin: "25px 0 15px", color: "#2c3e50" }}>開始使用</h3>
      <p style={{ fontSize: "16px", marginBottom: "25px" }}>
        請使用 Google 帳號登入，開始您的介聘之旅！
      </p>
      
      <div style={{ textAlign: "center", margin: "30px 0 10px" }}>
        <div style={{ display: "inline-block" }}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
          />
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;