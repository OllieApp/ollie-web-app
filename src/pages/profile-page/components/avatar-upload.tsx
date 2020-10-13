import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Slider, withStyles, useTheme, IconButton } from '@material-ui/core';
import { Flip } from '@material-ui/icons';
import { Plus } from 'react-feather';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
// eslint-disable-next-line import/no-unresolved
import { Point, Area } from 'react-easy-crop/types';
import { getCroppedImg } from '../../../common/image/crop';

interface Props {
    onSave: (image: string) => void;
    onCancel: () => void;
}

export function AvatarUpload({ onSave, onCancel }: Props) {
    const theme = useTheme();
    const [image, setImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [flipX, setFlipX] = useState<boolean>(false);
    const [flipY, setFlipY] = useState<boolean>(false);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (!acceptedFiles.length) return;
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = () => {
            const base64Str = reader.result;
            setImage(base64Str as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop });
    const handleAddPicture = useCallback(() => open(), [open]);
    const handleCropChange = useCallback((changedCrop: Point) => setCrop(changedCrop), []);
    const handleZoomChange = useCallback((changedZoom: number) => setZoom(changedZoom), []);
    const handleRotationChange = useCallback((changedRotation: number) => setRotation(changedRotation), []);

    const handleFlipX = useCallback(() => {
        setFlipX(!flipX);
        setRotation(360 - rotation);
    }, [flipX, rotation]);

    const handleFlipY = useCallback(() => {
        setFlipY(!flipY);
        setRotation(360 - rotation);
    }, [flipY, rotation]);

    const handleCropComplete = useCallback(
        (croppedArea: Area, changedCroppedArealPixels: Area) => setCroppedAreaPixels(changedCroppedArealPixels),
        [],
    );

    const handleSave = useCallback(async () => {
        try {
            if (!image || !croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
            onSave(croppedImage);
        } catch (e) {
            // TODO: Report
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }, [image, croppedAreaPixels, rotation]);

    return (
        <Box>
            <input type="file" {...getInputProps()} />
            <Box display="flex" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h3">Change Listing Photo</Typography>
                    <Typography variant="body2">
                        This profile photo will be displayed to patients on the app.
                    </Typography>
                </Box>
                <Box marginLeft="auto">
                    <Button variant="contained" color="primary" onClick={handleAddPicture}>
                        {image ? 'Select another' : 'Add picture'}
                    </Button>
                </Box>
            </Box>
            {image ? (
                <>
                    <Box
                        position="relative"
                        overflow="hidden"
                        borderRadius={25}
                        width="100%"
                        height={306}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Cropper
                            aspect={4 / 4}
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            onCropComplete={handleCropComplete}
                            onCropChange={handleCropChange}
                            onZoomChange={handleZoomChange}
                            onRotationChange={handleRotationChange}
                            transform={[
                                `translate(${crop.x}px, ${crop.y}px)`,
                                `rotateZ(${rotation}deg)`,
                                `rotateY(${flipX ? 180 : 0}deg)`,
                                `rotateX(${flipY ? 180 : 0}deg)`,
                                `scale(${zoom})`,
                            ].join(' ')}
                        />
                    </Box>
                    <Box display="flex" px={2} mt={3}>
                        <Box flex={1} mr={4}>
                            <Typography>Zoom</Typography>
                            <Slider
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e, newZoom) => setZoom(newZoom as number)}
                            />
                        </Box>
                        <Box flex={1} mr={4}>
                            <Typography>Rotation</Typography>
                            <Slider
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                aria-labelledby="Rotation"
                                onChange={(e, newRotation) => setRotation(newRotation as number)}
                            />
                        </Box>
                        <Box display="flex" flex={1}>
                            <Box mr={1}>
                                <IconButton color="primary" onClick={handleFlipX}>
                                    <Flip />
                                </IconButton>
                            </Box>
                            <Box>
                                <IconButton color="primary" onClick={handleFlipY}>
                                    <VerticalFlip />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </>
            ) : (
                <Dropzone
                    border={`4px dashed ${isDragActive ? theme.palette.primary.main : 'transparent'}`}
                    color="grey.800"
                    bgcolor="gray.darker"
                    borderRadius={25}
                    width="100%"
                    height={306}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    {...getRootProps()}
                >
                    <Box mb={1}>
                        <Plus size={32} />
                    </Box>
                    <Typography variant="body1">Drag and drop your photo here</Typography>
                    <Typography variant="body2">We support JPG and PNG formats</Typography>
                </Dropzone>
            )}

            <Box display="flex" mt={2}>
                <Box ml="auto" mr={3}>
                    <Button onClick={onCancel}>Cancel</Button>
                </Box>
                <Button color="primary" onClick={handleSave} disabled={!image}>
                    Save
                </Button>
            </Box>
        </Box>
    );
}

const Dropzone = withStyles({
    root: {
        cursor: 'pointer',
        outline: 'none',
    },
})(Box);

const VerticalFlip = withStyles({
    root: {
        transform: 'rotate(90deg)',
    },
})(Flip);
