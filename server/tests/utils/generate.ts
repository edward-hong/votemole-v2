export const buildReq = (overrides?: Record<string, unknown>) => ({
  body: {},
  params: {},
  ...overrides,
})

export const buildRes = (overrides?: Record<string, unknown>) => {
  const res: any = {
    json: jest.fn(() => res).mockName('json'),
    status: jest.fn(() => res).mockName('status'),
    ...overrides,
  }

  return res
}

export const buildNext = (impl?: any) => jest.fn(impl).mockName('next')
