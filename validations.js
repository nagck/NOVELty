email = /(^((\w+-)*\w+(\.(\w+-)*\w+)*@(\w+-)*\w+(\.([A-Za-z]{2,4})){1,4})$)/;

//username must be at least 3 characters (max 12) and start with a letter, can also only take numbers, letters and '_'
username = /^([0-9\w]){3,13}$/gi;

password = /(?=[0-9])(?=[a-z])(?=[+*?^$()[]{}\|\\])/