import { setApplication } from "@ember/test-helpers";
import Application from "dummy/app";
import config from "dummy/config/environment";
import { setupEmberOnerrorValidation, start } from "ember-qunit";
import { loadTests } from "ember-qunit/test-loader";
import setupSinon from "ember-sinon-qunit";
import * as QUnit from "qunit";
import { setup } from "qunit-dom";

setApplication(Application.create(config.APP));
setupSinon();

setup(QUnit.assert);

setupEmberOnerrorValidation();
loadTests();
start();
