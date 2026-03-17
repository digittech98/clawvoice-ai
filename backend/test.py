from anthropic import AsyncAnthropic
import os
import asyncio

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def test():
    models = await client.models.list()
    print(models)

asyncio.run(test())