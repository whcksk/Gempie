function loginRequired() {
  return function (req, res, next) {
    if (req.user) {
      next();
    } else {
      req.flash("error", "다음 작업을 수행하기 위해서는 로그인이 필요합니다.");
      return res.redirect("/auth/login?callback=" + req.originalUrl);
    }
  }
}

module.exports.loginRequired = loginRequired;
