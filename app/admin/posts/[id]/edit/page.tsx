import { getCategories } from "@/lib/categories"
import EditPostClient from "./EditPostClient"

export default async function EditPage() {
  const categories = await getCategories()

  return <EditPostClient categories={categories} />
}
