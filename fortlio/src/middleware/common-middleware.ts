
export const calculateResponseTime = {
  async requestDidStart() {
    const start = Date.now();
    return {
      async willSendResponse({ response }:any) {
        const duration = Date.now() - start;

        // 👇 Include duration in extensions (visible in GraphQL response)
        response.http.headers.set('X-Response-Time-Ms', duration.toString());
      },
    };
  },
};