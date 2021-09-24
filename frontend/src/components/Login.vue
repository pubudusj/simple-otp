<template>
<main class="form-signin">
  <div v-if="viewSuccessLoginView"><div class="alert alert-success">Successfully verified.</div></div>
  <form v-if="viewLoginForm">
    <h1 class="h3 mb-3 fw-normal">Please sign in</h1>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div class="form-floating">
      <input v-model="email" type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
      <label for="floatingInput">Email address</label>
    </div>
    <div class="form-floating">
      <input v-model="password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
      <label for="floatingPassword">Password</label>
    </div>
    <button class="w-100 btn btn-lg btn-primary" type="button" @click="login">Sign in</button>
  </form>
  <form v-if="viewVerificationForm">
    <h1 class="h3 mb-3 fw-normal">Enter verification code</h1>
    <div class="alert alert-primary" role="alert">
        A verification code is sent to the email address you provided.
    </div>
    <div class="form-floating">
      <input v-model="verificationCode" type="text" class="form-control" id="floatingPassword" placeholder="Verification code">
      <label for="floatingPassword">Verification code</label>
    </div>
    <button class="w-100 btn btn-lg btn-primary" type="button" @click="verify">Verify</button>
  </form>
  <p class="mt-5 mb-3 text-muted">&copy; <a target="_blank" href="https://pubudu.dev">pubudu.dev</a></p>
  </main>
</template>

<script>
import axios from 'axios'
import * as EmailValidator from 'email-validator';

export default {
  name: 'Login',
  props: {
    msg: String
  },
  data() {
      return {
          email: "",
          password: "",
          verificationCode: "",
          error: "",
          sessionId: "",
          viewLoginForm: false,
          viewVerificationForm: false,
          viewSuccessLoginView: false
      }
  },
  mounted() {
    this.showLoginForm()
  },
  methods:{
      login(){
          if (! this.email) {
            this.error = 'Email address is required.'
          } else if (! EmailValidator.validate(this.email)) {
            this.error = 'Invalid email address.'
          } else if (! this.email) {
            this.error = 'Password is required.'
          } else {
            this.submit();
          }
      },
      submit() {
        //TODO: First login the user with credentials
        // Once success, send the verification code.
        // For demo purpose, login functionality is skipped here

        this.sendVerification()
      },
      sendVerification() {
        var self = this
        axios
          .post(process.env.VUE_APP_API_BASE_URL+'otp/generate', { email: this.email }, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(function(response) {
              self.sessionId = response.data.data.token
              self.showVerificationForm()
            })
          .catch(function () {
            self.error = 'Error generating OTP.'
            self.showLoginForm()
          })
      },
      verify() {
        if (! this.verificationCode) {
          this.error = 'Verification code is required.'
        } else {
          this.validateVerification()
        }
      },
      validateVerification() {
        var self = this
        axios
          .post(process.env.VUE_APP_API_BASE_URL+'otp/verify', { 'token': self.verificationCode, 'sessionId': self.sessionId }, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(function() {
              self.showLoginSuccessView()
            })
          .catch(function () {
            self.error = 'Error validating OTP.'
            self.showLoginForm()
          })
      },
      showLoginForm() {
        this.email = ""
        this.password = ""
        this.verificationCode = ""
        this.sessionId = ""
        this.viewLoginForm = true
        this.viewVerificationForm = false
        this.viewSuccessLoginView = false
      },
      showVerificationForm() {
        this.viewLoginForm = false
        this.viewVerificationForm = true
        this.viewSuccessLoginView = false
      },
      showLoginSuccessView() {
        this.viewLoginForm = false
        this.viewVerificationForm = false
        this.viewSuccessLoginView = true
      },
  }
}
</script>

<style scoped>
html,
body {
  height: 100%;
}

body {
  display: -ms-flexbox;
  display: -webkit-box;
  display: flex;
  -ms-flex-align: center;
  -ms-flex-pack: center;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
}

.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: 20px auto;
}
.form-signin .checkbox {
  font-weight: 400;
}
.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.form-signin input[type="text"] {
  margin-bottom: 10px;
}
</style>
