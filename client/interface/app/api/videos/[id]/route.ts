import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const response = await fetch("http://localhost:3333/videos", {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Erro ao buscar lista de vídeos" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const allVideos = data.videos || [];

    const specificVideo = allVideos.find((v: any) => v.id.toString() === id);

    if (!specificVideo) {
      return NextResponse.json(
        { message: "Vídeo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Vídeo encontrado",
      videos: [specificVideo],
    });
  } catch (error) {
    console.error("Erro no proxy de detalhes:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const authHeader = request.headers.get("Authorization");

  const response = await fetch(`http://localhost:3333/videos/${id}`, {
    method: "DELETE",
    headers: { Authorization: authHeader || "" },
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao deletar" },
      { status: response.status }
    );
  }

  return NextResponse.json({ message: "Deletado com sucesso" });
}
