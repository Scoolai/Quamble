import React, { useState } from 'react';
import "../styles/loginandsignup.css";

function Or() {
  return (
    <div className="divider-container">
      <hr className="divider-line" />
      <span className="divider-text">or</span>
      <hr className="divider-line" />
    </div>
  );
}

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className='box-container'>
      <div className='form-container'>
        <div className='form-toggle'>
          <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>Login</button>
          <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>SignUp</button>
        </div>
        {
          isLogin ? <>
            <div className='form'>
              <h1>Login</h1>
              <input type="email" placeholder='Email' />
              <input type="password" placeholder='Password' />
              <a href="">Forget Password?</a>
              <button className='submit-btn'>Login</button>
              <Or />
              <div className='social-login'>
                <button className='google-btn'><i className="fab fa-google"></i>Login with Google</button>
                <br />
                <button className='facebook-btn'><i className='fab fa-facebook-f'></i>Login with Facebook</button>
              </div><br />
              {/* <p>Not a member? <a href="#" onClick={() => setIsLogin(false)}>SignUp</a></p> */}
            </div>
          </> :
            <>
              <div className='form'>
                <h1>SignUp</h1>
                <input type="email" placeholder='Email' />
                <input type="password" placeholder='Password' />
                <input type="password" placeholder='Confirm Password' />
                <button className='submit-btn'>Sign Up</button>
                <Or />
                <div className='social-login'>
                  <button className='google-btn'><i className="fab fa-google"></i>SignUp with Google</button>
                  <br />
                  <button className='facebook-btn'><i className='fab fa-facebook-f'></i>SignUp with Facebook</button>
                </div><br />
                <p>Already have an account? <a href="" onClick={() => setIsLogin(true)}>Login</a></p>
              </div>
            </>
        }
      </div>
    </div>
  );
}
