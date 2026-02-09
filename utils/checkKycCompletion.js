module.exports.isKycComplete = (rider) => {
  return (
    rider?.kyc?.aadhar?.isVerified === true &&
    rider?.kyc?.aadhar?.status === "approved" &&

    rider?.kyc?.pan?.status === "approved" &&
    rider?.kyc?.pan?.image &&
    rider?.kyc?.pan?.number &&

    rider?.kyc?.drivingLicense?.status === "approved" &&
    rider?.kyc?.drivingLicense?.frontImage &&
    rider?.kyc?.drivingLicense?.backImage &&
    rider?.kyc?.drivingLicense?.number &&

    rider?.bankDetails?.addedBankAccount === true &&
    rider?.bankDetails?.bankVerificationStatus === "APPROVED" &&
    rider?.bankDetails?.ifscVerificationStatus === "APPROVED"
  );
};
