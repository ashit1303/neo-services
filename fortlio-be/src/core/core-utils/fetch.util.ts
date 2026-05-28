export type FetchRequestConfig = RequestInit & {
  params?: Record<string, string | number | boolean>;
};

const buildUrl = (url: string, params?: Record<string, string | number | boolean>) => {
  if (!params) { return url; }
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  return `${url}?${searchParams.toString()}`;
};

const request = async (method: string, url: string, data?: any, config?: FetchRequestConfig): Promise<any> => {
  try {

    const finalUrl = buildUrl(url, config?.params);

    const headers = new Headers(config?.headers);
    const isFormData = data instanceof FormData;

    if (data && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(finalUrl, {
      ...config,
      method,
      headers,
      body: data === null ? undefined : isFormData ? data : JSON.stringify(data),
    });

    const text = await res.text();
    const dataParsed = text ? JSON.parse(text) : null;

    if (!res.ok) {
      throw new Error(dataParsed?.message || text || res.statusText);
    }

    return dataParsed;

    // if (!response.ok) {
    //   console.error('Message:', response.statusText);
    //   console.error('Method:', method);
    //   console.error('URL:', finalUrl);
    //   console.error('Request Data:', data);
    //   console.error('Request Headers:', headers);
    //   console.error('Response Data:', responseData);

    //   throw new Error(typeof responseData === 'string' ? responseData : JSON.stringify(responseData));
    // }

    // return responseData as T;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const get = async (url: string, config?: FetchRequestConfig): Promise<any> => request('GET', url, undefined, config);

export const post = async (url: string, data: any = {}, config?: FetchRequestConfig): Promise<any> => request('POST', url, data, config);

export const put = async (url: string, data: any = {}, config?: FetchRequestConfig): Promise<any> => request('PUT', url, data, config);

export const patch = async (url: string, data: any = {}, config?: FetchRequestConfig): Promise<any> => request('PATCH', url, data, config);

export const del = async (url: string, config?: FetchRequestConfig): Promise<any> => request('DELETE', url, undefined, config);