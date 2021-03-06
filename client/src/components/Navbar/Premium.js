import React from "react";
import { Link } from "react-router-dom";
import Auth from "../../utils/auth";

import logo from "../../assets/logo.png";

export default function Premium() {
	const logout = (event) => {
		event.preventDefault();
		Auth.logout();
	};
	return (
		<>
			<a href="/">
				<img
					className="ui bottom aligned small image"
					src={logo}
					alt="T.E.A.M. STEAM logo"
				/>
			</a>
			<Link to="/" className="navLink">
				Home
			</Link>
			<Link to="/new-event" className="navLink">
				Create Event
			</Link>
			<Link to="/me" className="navLink">
				Profile
			</Link>

			<Link to="#" className="navLink" onClick={logout}>
				Logout
			</Link>
		</>
	);
}
