const {Configuration, OpenAIApi} = require("openai");

const config = new Configuration({
    apiKey: "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"
});

const openaiapi = new OpenAIApi(config);

(
    async () => {
        const res = await openaiapi.createImage({
            prompt: "an astronout",
            n: 2,
            size: "1024x1024"
        });

        console.log("Response: ", res.data);
    }
)();