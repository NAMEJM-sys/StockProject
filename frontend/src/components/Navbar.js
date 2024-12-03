import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import ProfileIcon from "../assets/profile.png";
import '../styles/Navbar.css';
import '../styles/LinkText.css';

function Navbar(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className='navbar'>
            <h2 className="navbar-title"><Link to="/Home" className="no-underline-headline">주식.GG</Link></h2>
            <div className="profile-container" onClick={toggleMenu}>
                <img src={ProfileIcon} alt="Profile" className="profile-icon"/>
                {isMenuOpen && (
                    <div className="profile-menu">
                        <p>프로필</p>
                        <p onClick={() => navigate('/detail', { state: { stockCode: "005930", stockName: "삼성전자" } })} className="no-underline-other">관심 종목</p>
                        <p onClick={() => navigate('/finance')} className="no-underline-other">설정</p>
                        <p>로그아웃</p>
                        <p onClick={() => navigate('/TechChart')} className="no-underline-other"> VIP 추천 종목</p>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Navbar