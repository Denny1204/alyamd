const axios = require('axios')

class TrueCaller {
  constructor({ phone, countryCode }) {
    if (isNaN(phone)) throw new Error('Invalid number input')
    if (!countryCode) throw new Error('Country code is required')

    this.phone = parseInt(phone)
    this.countryCode = countryCode
    this.sessionId = null
    this.token = null
  }

  async login() {
    const { data } = await axios.post(
      'https://asia-south1-truecaller-web.cloudfunctions.net/webapi/noneu/auth/truecaller/v1/send-otp',
      {
        phone: this.phone,
        countryCode: this.countryCode
      },
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          origin: 'https://www.truecaller.com',
          referer: 'https://www.truecaller.com/',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36'
        }
      }
    )

    this.sessionId = data.sessionId
    return data
  }

  async verifyOtp(otp) {
    if (!otp) throw new Error('OTP is required')
    if (!this.sessionId) throw new Error('Login first')

    const { data } = await axios.post(
      'https://asia-south1-truecaller-web.cloudfunctions.net/webapi/noneu/auth/truecaller/v1/verify-otp',
      {
        sessionId: this.sessionId,
        verificationCode: otp,
        phone: this.phone,
        countryCode: this.countryCode
      },
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          origin: 'https://www.truecaller.com',
          referer: 'https://www.truecaller.com/',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36'
        }
      }
    )

    this.token = data.accessToken
    return data
  }

  async checkNumber(phone, countryCode = 'id') {
    if (!this.token) throw new Error('Login first')
    if (isNaN(phone)) throw new Error('Invalid phone number')

    const { data } = await axios.get(
      'https://asia-south1-truecaller-web.cloudfunctions.net/webapi/noneu/search/v2',
      {
        headers: {
          accept: '*/*',
          authorization: `Bearer ${this.token}`,
          origin: 'https://www.truecaller.com',
          referer: 'https://www.truecaller.com/',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36'
        },
        params: {
          q: phone,
          countryCode,
          type: '44'
        }
      }
    )

    return data
  }
}

module.exports = TrueCaller
