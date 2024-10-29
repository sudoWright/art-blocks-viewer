import { isAddress } from "viem";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { CoreDeployment } from "../deployments/cores";
import squig from "./img/lil-squig.png";
import { NewTabIcon } from "./newTabIcon";
import { GitHubIcon } from "./gitHubIcon";

const StyledErrorMessage = ({ msg }: { msg: string }) => {
  return <div style={{ fontSize: "small", color: "red" }}>{msg}</div>;
};

export const InputForm = ({
  coreDeploymentOptions,
}: {
  coreDeploymentOptions: CoreDeployment[];
}) => {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>
        <img
          src={squig}
          width={50}
          alt="lil squig"
          style={{ marginRight: "0.5rem", position: "relative", top: "0.5rem" }}
        />
        Art Blocks On-Chain Generator
      </h1>
      <Formik
        initialValues={{ contractAddress: "", tokenId: "" }}
        validate={(values) => {
          const errors: Partial<{ contractAddress: string; tokenId: string }> =
            {};
          if (!isAddress(values.contractAddress)) {
            errors.contractAddress = "invalid contract address";
          }
          if (values.tokenId == "" || isNaN(Number(values.tokenId))) {
            errors.tokenId = "invalid token id";
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          window.open(
            window.location.origin +
              import.meta.env.BASE_URL +
              `${values.contractAddress}/${values.tokenId}`,
            "_blank"
          );
          setSubmitting(false);
        }}
      >
        {({ isValid, dirty }) => (
          <Form>
            <label>token contract address</label>
            <br />
            <Field
              type="text"
              id="contract-address"
              list="contracts"
              placeholder="0x..."
              name="contractAddress"
              style={{ width: "350px" }}
            />
            <datalist id="contracts">
              {coreDeploymentOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  label={option.label}
                ></option>
              ))}
            </datalist>
            <ErrorMessage name="contractAddress">
              {(msg) => <StyledErrorMessage msg={msg} />}
            </ErrorMessage>
            <div style={{ marginTop: "0.5rem" }}>
              <label>token id</label>
              <br />
              <Field
                type="text"
                id="token-id"
                placeholder="3000000"
                name="tokenId"
                style={{ width: "150px" }}
              />
            </div>
            <ErrorMessage name="tokenId">
              {(msg) => <StyledErrorMessage msg={msg} />}
            </ErrorMessage>
            <section style={{ marginTop: "1rem" }}>
              <button type="submit" disabled={!isValid || !dirty}>
                view output{" "}
                <NewTabIcon fill={!isValid || !dirty ? "gray" : "white"} />
              </button>
            </section>
          </Form>
        )}
      </Formik>
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "right", width: "450px" }}>
          <a
            href="https://github.com/ArtBlocks/on-chain-generator-viewer"
            target="_blank"
          >
            <GitHubIcon fill="gray" />
          </a>
        </div>
      </div>
    </div>
  );
};
