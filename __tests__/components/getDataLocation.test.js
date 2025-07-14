import getDataLocation from '../../src/components/getDataLocation';

describe('getDataLocation', () => {
  const mockFetchSuccess = (data) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(data),
      })
    );
  };

  const mockFetchFailure = () => {
    global.fetch = jest.fn(() => Promise.reject('API is down'));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return location data on successful fetch', async () => {
    const mockData = {
      display_name: '123 Main St, City, Country',
      address: {
        neighbourhood: 'Downtown',
      },
    };
    mockFetchSuccess(mockData);

    const latitude = 123;
    const longitude = 456;
    const result = await getDataLocation(latitude, longitude);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          "User-Agent": "LastBiteApp/1.0 (herianto9671@gmail.com)",
        },
      }
    );
    expect(result).toEqual({
      address: 'Downtown',
      display_name: '123 Main St, City, Country',
    });
  });

  it('should return null if address is not found', async () => {
    const mockData = {
      display_name: '123 Main St, City, Country',
      address: {},
    };
    mockFetchSuccess(mockData);

    const latitude = 123;
    const longitude = 456;
    const result = await getDataLocation(latitude, longitude);

    expect(result).toEqual({
      address: 'Kelurahan tidak ditemukan',
      display_name: '123 Main St, City, Country',
    });
  });

  it('should return null on fetch failure', async () => {
    mockFetchFailure();

    const latitude = 123;
    const longitude = 456;
    const result = await getDataLocation(latitude, longitude);

    expect(result).toBeNull();
  });

  it('should handle missing display_name in API response', async () => {
    const mockData = {
      address: {
        neighbourhood: 'Downtown',
      },
    };
    mockFetchSuccess(mockData);

    const latitude = 123;
    const longitude = 456;
    const result = await getDataLocation(latitude, longitude);

    expect(result).toEqual({
      address: 'Downtown',
      display_name: undefined,
    });
  });
});