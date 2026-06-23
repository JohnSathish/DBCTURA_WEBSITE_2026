import "dotenv/config"
import { seedCommittees } from "@/lib/committees-service"

async function main() {
  const replace = process.argv.includes("--replace")
  console.log(replace ? "Re-seeding committees (replace)..." : "Seeding committees...")
  const result = await seedCommittees(replace)
  console.log(result.message ?? JSON.stringify(result))
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
