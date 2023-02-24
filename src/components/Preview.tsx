import { FC, memo } from "react";
import Image from "next/image";
import { ActionIcon } from "@mantine/core";
import { MdOutlineClose } from "react-icons/md";

type Props = {
  src: string;
  removePreviewImage: () => void;
  loading: boolean;
};

const Preview: FC<Props> = ({ src, removePreviewImage, loading }) => {
  return (
    <div className="preview-image">
      <ActionIcon
        variant="outline"
        radius="xl"
        className="close-button"
        onClick={() => removePreviewImage()}
        disabled={loading}
        title="Remove image"
      >
        <MdOutlineClose size={16} />
      </ActionIcon>
      <Image src={src} alt="" fill />
    </div>
  );
};

export default memo(Preview);
