import React, { useState, useEffect } from "react";
import Jamming from "./Jamming.js";

const redirectURI = "https://jose69420xxx.github.io/Jamming/index.html"; 
const authURL = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = "user-read-private user-read-email";
const clientID = "fe468f6f8ff049ea8a0fff4d991bf9a2";

// Extract authorization code from URL
const fetchAuthCodeFromBrowser = () => {
  const args = new URLSearchParams(window.location.search);
  return args.get("code");
};

// Redirect user to Spotify authentication page
async function redirectToSpotifyAuthorize() {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

  const codeVerifier = randomString;
  const data = new TextEncoder().encode(codeVerifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);

  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  window.sessionStorage.setItem("code_verifier", codeVerifier);

  const authUrl = new URL(authURL);
  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientID,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectURI,
  }).toString();

  window.location.href = authUrl.toString();
}

// Exchange authorization code for access token
async function getToken(code) {
  try {
    const codeVerifier = sessionStorage.getItem("code_verifier");

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientID,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectURI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch token");
    return await response.json();
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
}

// Refresh the access token
async function refreshToken(refresh_token) {
  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientID,
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
    });

    if (!response.ok) throw new Error("Failed to refresh token");
    return await response.json();
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

const LandingPage = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);

  // Handle initial authentication
  useEffect(() => {
    const code = fetchAuthCodeFromBrowser();
    const refresh_token = sessionStorage.getItem("refresh_token");

    if (code) {
      getToken(code).then((tokenData) => {
        if (tokenData && tokenData.access_token) {
          setAccessToken(tokenData.access_token);
          setExpiresIn(tokenData.expires_in);
          sessionStorage.setItem("refresh_token", tokenData.refresh_token);
          setIsAuthed(true);
        }
      });
    } else if (refresh_token) {
      // If a refresh token exists, attempt to refresh
      refreshToken(refresh_token).then((tokenData) => {
        if (tokenData && tokenData.access_token) {
          setAccessToken(tokenData.access_token);
          setExpiresIn(tokenData.expires_in);
          setIsAuthed(true);
        } else {
          sessionStorage.removeItem("refresh_token"); // Invalid refresh token, clear it
        }
      });
    }
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (expiresIn > 0) {
      const refresh_token = sessionStorage.getItem("refresh_token");
      if (!refresh_token) return;

      const refreshInterval = setInterval(async () => {
        const newTokenData = await refreshToken(refresh_token);
        if (newTokenData && newTokenData.access_token) {
          setAccessToken(newTokenData.access_token);
          setExpiresIn(newTokenData.expires_in);
        } else {
          console.error("Failed to refresh token, logging out...");
          setIsAuthed(false);
          sessionStorage.removeItem("refresh_token");
        }
      }, (expiresIn - 60) * 1000); // Refresh 1 min before expiry

      return () => clearInterval(refreshInterval); // Cleanup
    }
  }, [expiresIn]);

  return (
    <div>
      <h1>Spotify Auth</h1>
      {isAuthed ? (
        <Jamming accessToken={accessToken} />
      ) : (
        <button onClick={redirectToSpotifyAuthorize}>Login with Spotify</button>
      )}
    </div>
  );
};

export default LandingPage;
