import React, { useState } from "react";
import { ImageCard, ImageCardModal } from "../../component/ImageCard";
import { useStoreActions, useStoreState } from "../../redux/store";
import { AggregateFilter } from "../../model/Filter";
import { ImageRequestModel } from "../../model/ImageRequestModel";
import { Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { AlbumCard } from "../../component/AlbumCard";

export const ImageGridView: React.FC = () => {
    const state = {
        images: useStoreState(state => state.imageRequestResults),
        filters: useStoreState(
            state => state.filterModel.activeImageResultFilters,
        ),
    };
    const actions = {
        toggleImageSelection: useStoreActions(actions => actions.imageRequestResults.toggleImageSelection),
        toggleAlbumSelection: useStoreActions(actions => actions.imageRequestResults.toggleAlbumSelection),
    };

    const activeFilters = () => {
        return AggregateFilter<ImageRequestModel>(
            ...state.filters,
        );
    };

    const [openModal, setOpenModal] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    return (
        <Grid container spacing={3} justify="space-between">
            <ImageCardModal imageLink={previewImage} open={openModal} onClose={() => setOpenModal(false)}/>

            {state.images.imageResults
                .filter(activeFilters())
                .map((imageResult, index) => (
                    <Grid item key={imageResult.imageLink}>
                        <ImageCard
                            imageLink={imageResult.imageLink}
                            isSelected={imageResult.isSelected}
                            onSelectClick={() => {
                                actions.toggleImageSelection(index);
                            }}
                            onImageClick={() => {
                                setPreviewImage(imageResult.imageLink);
                                setOpenModal(true);
                            }}
                        >
                            <Typography variant="body2" color="textSecondary" component="p">
                                <b>Requested by</b>: {imageResult.requestedBy}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                <b>Fulfilled by</b>: {imageResult.fulfilledBy}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                <b>Score</b>: {imageResult.score}
                            </Typography>
                        </ImageCard>
                    </Grid>
                ))}
            {state.images.albumResults
                .map((albumResult, index) => (
                    <Grid item key={albumResult.albumLink}>
                        <AlbumCard
                            albumLink={albumResult.albumLink}
                            imageLinks={albumResult.imageLinks}
                            onSelectClick={(image) => {
                                actions.toggleAlbumSelection([index, image]);
                            }}
                            isSelected={(image) => state.images.albumResults[index].selectedLinks.includes(image)}
                            onImageClick={(image?: string) => {
                                if (image) {
                                    setPreviewImage(image);
                                } else {
                                    setPreviewImage(albumResult.imageLinks[0]);
                                }
                                setOpenModal(true);
                            }}
                        >
                            <Typography variant="body2" color="textSecondary" component="p">
                                <b>Requested by</b>: {albumResult.requestedBy}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                <b>Fulfilled by</b>: {albumResult.fulfilledBy}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                <b>Score</b>: {albumResult.score}
                            </Typography>
                        </AlbumCard>
                    </Grid>
                ))}
        </Grid>

    );

};
