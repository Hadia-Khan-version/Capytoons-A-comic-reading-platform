/**
 * Send a standardized success response
 */
export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  })
}

/**
 * Send a standardized paginated response
 */
export const sendPaginated = (res, { data, total, page, limit }) => {
  return res.status(200).json({
    success:    true,
    data,
    pagination: {
      total,
      page:       parseInt(page),
      limit:      parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasMore:    page * limit < total,
    },
  })
}