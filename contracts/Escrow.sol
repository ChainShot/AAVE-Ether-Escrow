//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "./IERC20.sol";

interface IWETHGateway {
  function depositETH(address onBehalfOf, uint16 referralCode) external payable;
  function withdrawETH(uint256 amount, address to) external;
}

contract Escrow {
  address arbiter;
  address depositor;
  address beneficiary;
  uint initialDeposit;
  IWETHGateway gateway = IWETHGateway(0xDcD33426BA191383f1c9B431A342498fdac73488);
  IERC20 aWETH = IERC20(0x030bA81f1c18d280636F32af80b9AAd02Cf0854e);

  constructor(address _arb, address _ben) payable {
    arbiter = _arb;
    beneficiary = _ben;
    initialDeposit = msg.value;
    depositor = msg.sender;
    gateway.depositETH{value: address(this).balance}(address(this), 0);
  }

  receive() external payable {}

  function withdraw() external {
    uint balance = aWETH.balanceOf(address(this));
    aWETH.approve(address(gateway), balance);

    gateway.withdrawETH(balance, address(this));

    payable(beneficiary).transfer(initialDeposit);
    selfdestruct(payable(depositor));
  }
}
