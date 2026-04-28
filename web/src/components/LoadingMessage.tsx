import { Box, Spinner, Text } from "@radix-ui/themes";

export function LoadingMessage() {
  return (
    <Box>
      <Spinner/>
      <Text>Loading...</Text>
    </Box>
  )
}