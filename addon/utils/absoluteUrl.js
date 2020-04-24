export default (url, host = `${location.protocol}//${location.host}`) => {
  return /^http(s)?/.test(url) ? url : `${host}${url}`;
};
