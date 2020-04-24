export default (url) => {
  return url.indexOf("http") === 0
    ? url
    : `${location.protocol}//${location.host}${url}`;
};
