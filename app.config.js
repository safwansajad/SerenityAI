import 'dotenv/config';

export default {
  expo: {
    name: "SerenityAI",
    extra: {
      EXPO_PUBLIC_HUGGINGFACE_API_TOKEN: process.env.EXPO_PUBLIC_HUGGINGFACE_API_TOKEN,
    },
  },
};
