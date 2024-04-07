import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import {
  body,
  param,
  Result,
  validationResult,
  type CustomValidator,
} from "express-validator";
import { budgetData, type Envelope } from "./budgets";
import { ResponseError } from "./error";

const apiRouter = express.Router();
//custom middlware
const checkIfEnvelopeExists: CustomValidator = (value: string, { req }) => {
  const budgetEnvelopesNames: string[] = [];
  budgetData.envelopes.forEach((envelope) => {
    budgetEnvelopesNames.push(Object.keys(envelope)[0]);
  });
  if (!budgetEnvelopesNames.includes(value)) {
    throw new Error("Validation failed");
  }
  req[value] = budgetEnvelopesNames.indexOf(value);
  return true;
};

apiRouter.post(
  "/envelopes",
  [
    body("").notEmpty(),
    body("budget").notEmpty().isNumeric(),
    body("envelopes").notEmpty().isArray(),
    body("envelopes[*].*").notEmpty().isNumeric(),
  ],

  (req: Request, res: Response, next: NextFunction) => {
    const result: Result = validationResult(req);
    if (result.isEmpty()) {
      budgetData.budget = req.body.budget;
      req.body.envelopes.forEach((envelope: Envelope) => {
        budgetData.envelopes.push(envelope);
      });
      res.status(201).send({ success: "true", data: budgetData });
    } else {
      const error = new ResponseError(
        `bad request : ${result.array()[0].msg} at ${result.array()[0].path}`,
        400
      );
      next(error);
    }
  }
);

apiRouter.get("/envelopes", (req, res, next) => {
  if (budgetData.envelopes) {
    res.status(200).send({ success: "true", data: budgetData.envelopes });
  } else {
    const error = new ResponseError("not found", 404);
    next(error);
  }
});

apiRouter.get(
  "/envelopes/:id",
  [param("id").isNumeric()],

  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result: Result = validationResult(req);
    if (result.isEmpty()) {
      res
        .status(200)
        .send({ success: "true", data: budgetData.envelopes[Number(id)] });
    } else {
      const error = new ResponseError(
        `bad request : ${result.array()[0].msg} at ${result.array()[0].path}`,
        400
      );
      next(error);
    }
  }
);
apiRouter.put(
  "/envelopes/:id",

  [
    param("id").notEmpty().isNumeric(),
    body("data")
      .notEmpty({ ignore_whitespace: true })
      .isObject()
      .custom((value, { req }) => {
        if (Object.keys(value).length !== 1) {
          throw new Error("Validation failed");
        }
        return true;
      }),
    body("data.*").notEmpty().isNumeric(),
  ],

  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result: Result = validationResult(req);
    if (!result.isEmpty() && Number(id) > budgetData.envelopes.length - 1) {
      const error = new ResponseError(
        `bad request : ${result.array()[0].msg} at ${result.array()[0].path}`,
        400
      );
      next(error);
    } else {
      const newEnvelope = req.body.data;
      budgetData.envelopes[Number(id)] = newEnvelope;
      res.status(200).send(budgetData.envelopes[Number(id)]);
    }
  }
);
apiRouter.delete(
  "/envelopes/:id",
  [
    //Route
    param("id")
      .notEmpty()
      .isNumeric()
      .custom((value) => {
        if (!budgetData.envelopes[Number(value)]) {
          //validation rules from express-validation
          throw new Error("Validation failed");
        }
        return true;
      }),
  ],

  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result: Result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new ResponseError(
        `bad request : ${result.array()[0].msg} at ${result.array()[0].path}`,
        400
      );
      next(error);
    } else {
      budgetData.envelopes.splice(Number(id), 1);
      res.status(204).send();
    }
  }
);

apiRouter.post(
  "/envelopes/transfer/:from/:to",
  [
    param("from").notEmpty().isString().custom(checkIfEnvelopeExists),
    param("to").notEmpty().isString().custom(checkIfEnvelopeExists),
  ],

  (req: Request, res: Response, next: NextFunction) => {
    const result: Result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new ResponseError(
        `bad request : ${result.array()[0].msg} at ${result.array()[0].path}`,
        400
      );
      next(error);
    } else {
      const { from, to } = req.params;
      //@ts-ignore
      budgetData.envelopes[req[to]][to] = budgetData.envelopes[req[from]][from];
      res.status(200).send({ success: "true", from, to });
    }
  }
);

export default apiRouter;
