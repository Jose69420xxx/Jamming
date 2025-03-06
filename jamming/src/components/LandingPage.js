import React, { useState, useEffect } from "react";

const redirectURI = "https://Jose69420xxx.github.io/jamming/app.html"; // Your redirect URI
const authURL = "https://accounts.spotify.com/authorize"; // Spotify's authorization endpoint
const tokenEndpoint = "https://accounts.spotify.com/api/token"; // Token endpoint
const scope = "user-read-private user-read-email"; // Permissions required
const clientID = "fe468f6f8ff049ea8a0fff4d991bf9a2"; // Your Spotify client ID

// Extract the authorization code from URL
const fetchAuthCodeFromBrowser = () => {
  const args = new URLSearchParams(window.location.search);
  return args.get("code");
};

// Redirect user to Spotify authentication page
async function redirectToSpotifyAuthorize() {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce(
    (acc, x) => acc + possible[x % possible.length],
    ""
  );

  const codeVerifier = randomString;
  const data = new TextEncoder().encode(codeVerifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);

  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  window.localStorage.setItem("code_verifier", codeVerifier);

  const authUrl = new URL(authURL);
  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientID,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectURI,
  }).toString();

  window.location.href = authUrl.toString(); // Redirect to Spotify login
}

// Exchange the authorization code for an access token
async function getToken(code) {
  const codeVerifier = localStorage.getItem("code_verifier");

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

  return await response.json();
}

// Refresh the access token
async function refreshToken(refresh_token) {
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

  return await response.json();
}

// Landing Page Component
const LandingPage = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshTokenValue, setRefreshTokenValue] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);

  useEffect(() => {
    const code = fetchAuthCodeFromBrowser();
    if (code) {
      getToken(code).then((tokenData) => {
        if (tokenData.access_token) {
          setAccessToken(tokenData.access_token);
          setRefreshTokenValue(tokenData.refresh_token);
          setExpiresIn(tokenData.expires_in);
          setIsAuthed(true);

          // Store token data in localStorage
          localStorage.setItem("access_token", tokenData.access_token);
          localStorage.setItem("refresh_token", tokenData.refresh_token);
        }
      });
    }
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (expiresIn > 0) {
      const refreshInterval = setInterval(async () => {
        const newTokenData = await refreshToken(refreshTokenValue);
        if (newTokenData.access_token) {
          setAccessToken(newTokenData.access_token);
          setExpiresIn(newTokenData.expires_in);
          localStorage.setItem("access_token", newTokenData.access_token);
        }
      }, (expiresIn - 60) * 1000); // Refresh 1 minute before expiry

      return () => clearInterval(refreshInterval);
    }
  }, [expiresIn, refreshTokenValue]);

  return (
    <div>
      <h1>Spotify Auth</h1>
      {isAuthed ? (
        <p>Authenticated! Token: {accessToken}</p>
      ) : (
        <button onClick={redirectToSpotifyAuthorize}>Login with Spotify</button>
      )}
    </div>
  );
};

export default LandingPage;
