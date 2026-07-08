import { ChatbotBuilder } from "@/components/marketing/chatbot/chatbot-builder";

export default async function ChatbotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatbotBuilder chatbotId={id} />;
}
