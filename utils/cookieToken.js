exports.setCookieToken = async (res, user) => {
  let token = await user.getJwtToken();

  res
    .cookie("token", token, {
      expire: Date.now() + 6 * 60 * 60 * 1000,
      httpOnly: true,
    })
    .json({
      success: true,
      token,
      user,
    });
};
