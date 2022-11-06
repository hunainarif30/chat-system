const jose = require("jose");

function generateEncryptedJwt(subject, payload, secret) {
  return new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setSubject(subject)
    .setIssuer("https://fast.com")
    .setAudience(payload.name)
    .setExpirationTime("1d")
    .encrypt(secret);
}
// const decryptJwt = async (jwt, secret) => {
// 	const options = {
// 		issuer: "https://fast.com",
// 		audience: "https://example.com/test",
// 		contentEncryptionAlgorithms: ["A256GCM"],
// 		keyManagementAlgorithms: ["dir"],
// 	};
// 	return jose.jwtDecrypt(jwt, secret, options);
// };

module.exports = generateEncryptedJwt;
