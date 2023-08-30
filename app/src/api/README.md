# The `api/` folder

This frontend app gets data from a FastAPI Python API called **champolib**. The HTTP requests are made through **axios**.

- `routes` folder: one file for each route in the API. In each file, there's a function for the different endpoints, with typing, error handling and params handling from inputs.
- `config.ts` axios configuration.
- `index.ts` import all files from `routes`, so that all endpoint functions are imported from the same place.
- `types.ts`: all the backend types and error types

## API routes

The file name is the same as the champolib corresponding router.

To check the meaning of the French words, check [i18n paragraph](../../../README_EN.md#i18n)

## Error handling

In order to avoid using try/catch blocks everywhere on the frontend routes, errors from the API are formatted and handled inside the endpoint functions.
Each endpoint returns the desired type or `AppError`.
Then, the front routes can check if the call returned an error or not thanks to the `isAppError` util function.
