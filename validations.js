// email must:
//  - starts with a-zA-Z0-9 or _
//  - includes ...@...(dot)something
//  - supports multiple top level domains i.e. 'in.co.uk' (up to a max of 4)
//  - individual TLDs must be 1-4 *letters* long
const isValidEmail = (email) => (/(^((\w+-)*\w+(\.(\w+-)*\w+)*@(\w+-)*\w+(\.([A-Za-z]{2,4})){1,4})$)/).test(email);

//username must be at least 3 characters (max 12) and start with a letter, can also only take numbers, letters and '_'
const isValidUsername = (username) => (/^[0-9\w]{3,12}$/i).test(username);

// there has to be a uppercase letter, a lowercase letter, a number and a special character (one from !@#$%^&*\-()+)
// the password is between 6 to 20 characters long
// contains no whitespace
const isValidPassword = (password) => (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*\-()+])\S{6,20}$/).test(password)

