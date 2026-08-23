import router from "../routes/router";

describe("Main API router (/api/v1)", () => {
    it("should mount all seven sub-routers", () => {
        const layers = (router as any).stack as Array<{ regexp: RegExp }>;
        const sources = layers.map((layer) => layer.regexp.source);

        expect(layers).toHaveLength(7);

        const expectedMounts = [
            "/user",
            "/content",
            "/content/audit",
            "/router",
            "/group",
            "/feature",
            "/feature/audit",
        ];

        for (const path of expectedMounts) {
            const escaped = path.replace(/\//g, "\\/");
            expect(sources.some((source) => source.includes(escaped))).toBe(true);
        }
    });
});