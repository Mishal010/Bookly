export const buildQueryOptions = (reqQuery) => {
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder,
    search,
    minPrice,
    maxPrice,
    fields,
    ...filters
  } = reqQuery;

  const options = {
    skip: parseInt(page - 1) * parseInt(limit),
    limit: parseInt(limit),
  };

  if (sortBy) {
    options.sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
  }

  if (fields) {
    options.select = fields.split(",").join(" ");
  }
  return {
    filters,
    options,
    page: parseInt(page),
    limit: parseInt(limit),
    minPrice,
    maxPrice,
    search,
  };
};
