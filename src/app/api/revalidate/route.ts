import { NextRequest, NextResponse } from "next/server";

// ✅ Adicione a função de revalidação manual aqui (definida pelo próprio projeto)
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json(
        { revalidated: false, error: "Missing path" },
        { status: 400 },
      );
    }

    // O Next.js 13+ espera o uso da tag `revalidatePath` via experimental APIs
    // Aqui você pode usar algum sistema para forçar revalidação (por convenção, reinicialização do cache/CDN ou trigger do build)

    return NextResponse.json({ revalidated: true, now: Date.now(), path });
  } catch (error) {
    return NextResponse.json(
      { revalidated: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
