"use client"

import { useMbWallet } from "@mintbase-js/react"
import { saveAs } from "file-saver"
import { create } from "ipfs-http-client"
import { Download, Share2, X } from "lucide-react"
import Image from "next/image"
import deductNearEquivalentToOneDollar from "../lib/nearContract"
import { Button } from "./ui/button"

const DisplayFiles: React.FC<DisplayFilesProps> = ({ files, setFiles }) => {
  const { isConnected, activeAccountId } = useMbWallet()
  const ipfs = create({
    host: "localhost",
    port: 5001,
    protocol: "http",
  })

  const removeFile = (hash: string) => {
    setFiles((prev) => prev.filter((file) => file.hash !== hash))
  }

  const downloadFile = async (file: { hash: string; name: string }) => {
    const stream = ipfs.cat(file.hash)
    let data = new Uint8Array()

    for await (const chunk of stream) {
      data = Uint8Array.from([...data, ...chunk])
    }

    const blob = new Blob([data.buffer], { type: "application/octet-stream" })
    saveAs(blob, file.name)
    if (isConnected && activeAccountId) {
      try {
        await deductNearEquivalentToOneDollar(
          activeAccountId,
          "aay7ush.testnet"
        )
        console.log("Deduction successful.")
      } catch (error) {
        console.error("Error during balance check or deduction:", error)
      }
    }
  }

  const shareFile = async (hash: string) => {
    const url = `https://ipfs.io/ipfs/${hash}?download=true`
    navigator.clipboard.writeText(url)
    if (isConnected && activeAccountId) {
      try {
        await deductNearEquivalentToOneDollar(
          activeAccountId,
          "aay7ush.testnet"
        )
        console.log("Deduction successful.")
      } catch (error) {
        console.error("Error during balance check or deduction:", error)
      }
    }
    alert("Shareable Link Copied to Clipboard")
  }

  return (
    <section className="space-y-5 overflow-y-scroll max-h-[420px] overflow-hidden no-scrollbar">
      {files.map((file) => (
        <div className="flex items-center gap-3 shadow-sm p-2" key={file.id}>
          <Image src="/file-icon.svg" alt="file icon" width={50} height={50} />

          <div className="w-full">
            <p className="text-lg font-bold">{file.name}</p>
            <p className="text-gray-500 text-sm">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>

          <div className="flex gap-3">
            <Button size={"icon"} onClick={() => shareFile(file.hash)}>
              <Share2 size={18} />
            </Button>

            <Button size={"icon"} onClick={() => downloadFile(file)}>
              <Download size={18} />
            </Button>

            <Button
              variant={"destructive"}
              size={"icon"}
              onClick={() => removeFile(file.hash)}
            >
              <X size={18} />
            </Button>
          </div>
        </div>
      ))}
    </section>
  )
}

export default DisplayFiles
