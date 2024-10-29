export type CoreDeployment = {
  label: string;
  value: string;
};

export const coreDeployments: {
  [key: string]: CoreDeployment[];
} = {
  "1": [
    {
      label: "Art Blocks Flagship: V0",
      value: "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a",
    },
    {
      label: "Art Blocks Flagship: V1",
      value: "0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270",
    },
    {
      label: "Art Blocks Flagship: V3",
      value: "0x99a9B7c1116f9ceEB1652de04d5969CcE509B069",
    },
    {
      label: "Art Blocks Curated: V3.2",
      value: "0xAB0000000000aa06f89B268D604a9c1C41524Ac6",
    },
  ],
  "11155111": [
    {
      label: "Sepolia Example",
      value: "0xEC5DaE4b11213290B2dBe5295093f75920bD2982",
    },
  ],
};
