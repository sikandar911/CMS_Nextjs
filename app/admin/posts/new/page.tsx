import { getCategories } from "@/lib/categories"
import NewPostClient from "./NewPostClient"

export default async function NewPage() {
  const categories = await getCategories()

  return <NewPostClient categories={categories} />
}
