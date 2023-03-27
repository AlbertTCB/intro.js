import cloneObject from "../util/cloneObject";
import createElement from "../util/createElement";
import { Step } from "./steps";

/**
 * Finds all Intro steps from the data-* attributes and the options.steps array
 *
 * @api private
 */
export default function fetchIntroSteps(targetElm: HTMLElement) {
  const allIntroSteps: HTMLElement[] = Array.from(
    targetElm.querySelectorAll("*[data-intro]")
  );
  let introItems: Step[] = [];

  if (this._options.steps) {
    //use steps passed programmatically
    for (const step of this._options.steps) {
      const currentItem: Step = cloneObject(step);

      //set the step
      currentItem.step = introItems.length + 1;

      currentItem.title = currentItem.title || "";

      //use querySelector function only when developer used CSS selector
      if (typeof currentItem.element === "string") {
        //grab the element with given selector from the page
        currentItem.element = document.querySelector<HTMLElement>(
          currentItem.element
        );
      }

      //intro without element
      if (
        typeof currentItem.element === "undefined" ||
        currentItem.element === null
      ) {
        let floatingElementQuery = document.querySelector<HTMLElement>(
          ".introjsFloatingElement"
        );

        if (floatingElementQuery === null) {
          floatingElementQuery = createElement("div", {
            className: "introjsFloatingElement",
          });

          document.body.appendChild(floatingElementQuery);
        }

        currentItem.element = floatingElementQuery;
        currentItem.position = "floating";
      }

      currentItem.position =
        currentItem.position || this._options.tooltipPosition;
      currentItem.scrollTo = currentItem.scrollTo || this._options.scrollTo;

      if (typeof currentItem.disableInteraction === "undefined") {
        currentItem.disableInteraction = this._options.disableInteraction;
      }

      if (currentItem.element !== null) {
        introItems.push(currentItem);
      }
    }
  } else {
    //use steps from data-* annotations
    const elmsLength = allIntroSteps.length;
    let disableInteraction: boolean;

    //if there's no element to intro
    if (elmsLength < 1) {
      return [];
    }

    for (const currentElement of allIntroSteps) {
      // start intro for groups of elements
      if (
        this._options.group &&
        currentElement.getAttribute("data-intro-group") !== this._options.group
      ) {
        continue;
      }

      // skip hidden elements
      if (currentElement.style.display === "none") {
        continue;
      }

      const step = parseInt(currentElement.getAttribute("data-step"), 10);

      if (currentElement.hasAttribute("data-disable-interaction")) {
        disableInteraction = !!currentElement.getAttribute(
          "data-disable-interaction"
        );
      } else {
        disableInteraction = this._options.disableInteraction;
      }

      if (step > 0) {
        introItems[step - 1] = {
          element: currentElement,
          title: currentElement.getAttribute("data-title") || "",
          intro: currentElement.getAttribute("data-intro"),
          step: parseInt(currentElement.getAttribute("data-step"), 10),
          tooltipClass: currentElement.getAttribute("data-tooltip-class"),
          highlightClass: currentElement.getAttribute("data-highlight-class"),
          position:
            currentElement.getAttribute("data-position") ||
            this._options.tooltipPosition,
          scrollTo:
            currentElement.getAttribute("data-scroll-to") ||
            this._options.scrollTo,
          disableInteraction,
        };
      }
    }

    //next add intro items without data-step
    //todo: we need a cleanup here, two loops are redundant
    let nextStep = 0;

    for (const currentElement of allIntroSteps) {
      // start intro for groups of elements
      if (
        this._options.group &&
        currentElement.getAttribute("data-intro-group") !== this._options.group
      ) {
        continue;
      }

      if (currentElement.getAttribute("data-step") === null) {
        while (true) {
          if (typeof introItems[nextStep] === "undefined") {
            break;
          } else {
            nextStep++;
          }
        }

        if (currentElement.hasAttribute("data-disable-interaction")) {
          disableInteraction = !!currentElement.getAttribute(
            "data-disable-interaction"
          );
        } else {
          disableInteraction = this._options.disableInteraction;
        }

        introItems[nextStep] = {
          element: currentElement,
          title: currentElement.getAttribute("data-title") || "",
          intro: currentElement.getAttribute("data-intro"),
          step: nextStep + 1,
          tooltipClass: currentElement.getAttribute("data-tooltip-class"),
          highlightClass: currentElement.getAttribute("data-highlight-class"),
          position:
            currentElement.getAttribute("data-position") ||
            this._options.tooltipPosition,
          scrollTo:
            currentElement.getAttribute("data-scroll-to") ||
            this._options.scrollTo,
          disableInteraction,
        };
      }
    }
  }

  //removing undefined/null elements
  const tempIntroItems = [];
  for (let z = 0; z < introItems.length; z++) {
    if (introItems[z]) {
      // copy non-falsy values to the end of the array
      tempIntroItems.push(introItems[z]);
    }
  }

  introItems = tempIntroItems;

  //Ok, sort all items with given steps
  introItems.sort((a, b) => a.step - b.step);

  return introItems;
}
