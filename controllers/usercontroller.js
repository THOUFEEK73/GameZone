

export const signup = (req, res) => {
    if (req.session.user) {
      res.redirect('/user/home');
    } else {
      res.render('user/signup', { message: null });
    }
  };



