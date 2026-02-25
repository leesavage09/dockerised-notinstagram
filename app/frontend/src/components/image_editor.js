import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Transformations } from "../util/image";
import {
  imageEditorSelector,
  imageEditorActions,
} from "../redux/slice/image_editor_slice";
import { presetsMapping, applyPresetOnCanvas } from "instagram-filters";

export default function ImageEditor(props) {
  const dispatch = useDispatch();
  const myCanvas = React.useRef();
  const container = React.useRef();
  const {
    fitWidth: selectedFitWidth,
    rotation: selectedRotation,
    filter: selectedFilter,
  } = useSelector(imageEditorSelector.imageProcesses());
  const fitWidth = props.forceSquareImage ? true : selectedFitWidth;

  React.useEffect(() => {
    if (props.image) save();
  });

  const fit = () => {
    dispatch(imageEditorActions.updateFilters({ fitWidth: !fitWidth }));
  };

  const rotate = () => {
    dispatch(
      imageEditorActions.updateFilters({ rotation: selectedRotation + 90 }),
    );
  };

  const save = () => {
    let tempImage = props.image;
    tempImage = Transformations.rotateImg(tempImage, selectedRotation);
    tempImage = fitWidth
      ? Transformations.cropFitToSquareImg(tempImage)
      : tempImage;
    tempImage = Transformations.cropImageBetweenRatios(
      tempImage,
      4 / 5,
      16 / 9,
    );
    tempImage = Transformations.scaleImg(tempImage, props.maxRes);
    if (selectedFilter && selectedFilter !== "Normal")
      applyPresetOnCanvas(tempImage, presetsMapping[selectedFilter]());
    const displayImage = Transformations.centerImg(tempImage, 400);

    myCanvas.current.width = 400;
    myCanvas.current.height = 400;
    myCanvas.current.getContext("2d").drawImage(displayImage, 0, 0);

    dispatch(imageEditorActions.imageSavedSuccess(tempImage));
  };

  const fitButton = props.forceSquareImage ? (
    ""
  ) : (
    <a className="image-editor__fit-button image-fit" onClick={fit} />
  );

  return (
    <div ref={container} className="edit-mode">
      <div className="image-editor">
        <canvas className="image-editor__canvas" ref={myCanvas} />
        {fitButton}
        <a
          className="image-editor__rotate-button image-rotate"
          onClick={rotate}
        />
      </div>

      <div className="filter-buttons">
        {getAllowedFilterButtons(selectedFilter)}
      </div>

      <div className="image-editor-options">
        <button
          className="image-editor-options__filter ghost-button"
          onClick={() => {
            container.current.className = "filter-mode";
          }}
        >
          Filter
        </button>
        <button
          className="image-editor-options__edit ghost-button"
          onClick={() => {
            container.current.className = "edit-mode";
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function getAllowedFilterButtons(selectedFilter) {
  const filterButtons = [];
  const allowedFilters = [
    "Normal",
    "Clarendon",
    "Gingham",
    "Moon",
    "Lark",
    "Reyes",
    "Juno",
    "Slumber",
    "Crema",
    "Ludwig",
    "Aden",
    "Perpetua",
  ];
  allowedFilters.forEach((filterName) => {
    filterButtons.push(
      <FilterButton
        key={filterName}
        filterName={filterName}
        isSelected={selectedFilter === filterName}
      />,
    );
  });

  return filterButtons;
}

function FilterButton(props) {
  const dispatch = useDispatch();
  const imgSrc = `/filters/${props.filterName}.jpg`;
  const cName = props.isSelected
    ? "filter-buttons__text filter-buttons__text--selected"
    : "filter-buttons__text";
  return (
    <a
      className="filter-buttons__button"
      onClick={() => {
        dispatch(
          imageEditorActions.updateFilters({ filter: props.filterName }),
        );
      }}
    >
      <span className={cName}>{props.filterName}</span>
      <img className="filter-buttons__image" src={imgSrc} />
    </a>
  );
}
