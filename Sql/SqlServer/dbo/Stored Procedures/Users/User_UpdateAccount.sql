-- =============================================
-- Author:		Mark Entingh
-- Create date: 4/28/2012 1:43 PM
-- Description:	
-- =============================================
CREATE PROCEDURE User_UpdateAccount
	@userid int = 0,
	@email nvarchar(75) = '',
	@pass nvarchar(100) = ''
AS
BEGIN
	SET NOCOUNT ON;
	UPDATE Users SET email=@email, password=@pass WHERE userId=@userid
END
