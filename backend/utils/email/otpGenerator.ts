const AlphabeticOtpGenerator = (length: number) => {
    const alphabetic = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let otp = "";
    for (let i = 0; i<length;i++) {
        otp += alphabetic[Math.floor(Math.random() * alphabetic.length)]
    }

    return otp
}

const AlphaNumbericOtpGenerator = (length: number) => {
    const alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let otp = ""
    for (let i = 0;i<length;i++) {
        otp+= alphaNumeric[Math.floor(Math.random() * alphaNumeric.length)]
    }

    return otp
}

const NumbericOtpGenerator = (length: number) => {
    const numeric = "0123456789"
    let otp = ""
    for (let i = 0;i<length;i++) {
        otp+= numeric[Math.floor(Math.random() * numeric.length)]
    }
    return otp
}

export {AlphabeticOtpGenerator, AlphaNumbericOtpGenerator, NumbericOtpGenerator}